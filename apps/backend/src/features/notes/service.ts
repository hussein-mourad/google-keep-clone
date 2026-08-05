import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { noteImages, type NewNoteImage } from "../../db/schema/note-images";
import { notesTable, type NewNote, type NoteChecklistItem } from "../../db/schema/notes";
import { noteLabels, labels } from "../../db/schema/labels";
import { getStorage } from "../../lib/storage";

interface GetNotesOptions {
  labelId?: number;
  search?: string;
  archived?: boolean;
  trash?: boolean;
}

export async function getNotes(userId: string, opts: GetNotesOptions = {}) {
  const { labelId, search, archived, trash } = opts;

  const conditions = [eq(notesTable.userId, userId)];

  if (trash) {
    conditions.push(eq(notesTable.isDeleted, true));
  } else if (archived) {
    conditions.push(eq(notesTable.isArchived, true));
    conditions.push(eq(notesTable.isDeleted, false));
  } else {
    conditions.push(eq(notesTable.isArchived, false));
    conditions.push(eq(notesTable.isDeleted, false));
  }

  if (search) {
    conditions.push(
      sql`(${ilike(notesTable.title, `%${search}%`)} OR ${ilike(notesTable.content, `%${search}%`)} OR ${notesTable.checklist}::text ilike ${`%${search}%`})`,
    );
  }

  if (labelId) {
    const noteIds = db
      .select({ noteId: noteLabels.noteId })
      .from(noteLabels)
      .where(eq(noteLabels.labelId, labelId));
    conditions.push(inArray(notesTable.id, noteIds));
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(and(...conditions))
    .orderBy(desc(notesTable.isPinned), notesTable.sortOrder, desc(notesTable.updatedAt));

  const withLabels = await attachLabels(notes);
  return attachImages(withLabels);
}

export async function getNote(id: number, userId: string) {
  const [note] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)));
  if (!note) return undefined;
  const noteLabelsResult = await getNoteLabelsById(note.id);
  const images = await getNoteImages(note.id);
  const storage = getStorage();
  const imagesWithUrls = await Promise.all(
    images.map(async (img) => {
      const presignedUrl = storage
        ? await storage.getSignedUrl(img.key)
        : "";
      return {
        id: img.id,
        noteId: img.noteId,
        key: img.key,
        filename: img.filename,
        mimeType: img.mimeType,
        size: img.size,
        width: img.width,
        height: img.height,
        presignedUrl,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
      };
    }),
  );
  return { ...note, labels: noteLabelsResult, images: imagesWithUrls };
}

export async function createNote(
  note: NewNote,
  labelIds?: number[],
  userId?: string,
) {
  return db.transaction(async (tx) => {
    const [result] = await tx.insert(notesTable).values(note).returning();
    if (!result) throw new Error("Failed to create note");

    if (Array.isArray(labelIds) && labelIds.length > 0 && userId) {
      await setNoteLabelsTx(tx, result.id, labelIds, userId);
    }

    const noteLabelsResult = await getNoteLabelsByIdTx(tx, result.id);
    return { ...result, labels: noteLabelsResult, images: [] };
  });
}

export async function updateNote(
  id: number,
  userId: string,
  data: Partial<{
    title: string;
    content: string;
    isPinned: boolean;
    color: string | null;
    isArchived: boolean;
    isChecklist: boolean;
    checklist: NoteChecklistItem[];
  }>,
  labelIds?: number[],
) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .update(notesTable)
      .set(data)
      .where(
        and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
      )
      .returning();
    if (!result) throw new Error("Failed to update note");

    if (Array.isArray(labelIds)) {
      await setNoteLabelsTx(tx, id, labelIds, userId);
    }

    const noteLabelsResult = await getNoteLabelsByIdTx(tx, id);
    const noteImagesResult = await getNoteImages(id);
    const storage = getStorage();
    const imagesWithUrls = await Promise.all(
      noteImagesResult.map(async (img) => {
        const presignedUrl = storage
          ? await storage.getSignedUrl(img.key)
          : "";
        return {
          id: img.id,
          noteId: img.noteId,
          key: img.key,
          filename: img.filename,
          mimeType: img.mimeType,
          size: img.size,
          width: img.width,
          height: img.height,
          presignedUrl,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
        };
      }),
    );
    return { ...result, labels: noteLabelsResult, images: imagesWithUrls };
  });
}

export async function softDeleteNote(id: number, userId: string) {
  const [result] = await db
    .update(notesTable)
    .set({ isDeleted: true, deletedAt: new Date() })
    .where(
      and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
    )
    .returning();
  if (!result) throw new Error("Failed to delete note");
  const noteLabelsResult = await getNoteLabelsById(result.id);
  return { ...result, labels: noteLabelsResult, images: [] };
}

export async function restoreNote(id: number, userId: string) {
  const [result] = await db
    .update(notesTable)
    .set({ isDeleted: false, deletedAt: null, isArchived: false })
    .where(
      and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
    )
    .returning();
  if (!result) throw new Error("Failed to restore note");
  const noteLabelsResult = await getNoteLabelsById(result.id);
  return { ...result, labels: noteLabelsResult, images: [] };
}

export async function permanentDeleteNote(id: number, userId: string) {
  const images = await getNoteImagesByNoteId(id);
  const storage = getStorage();
  if (storage) {
    await Promise.allSettled(
      images.map((img) => storage.delete(img.key)),
    );
  }

  const [result] = await db
    .delete(notesTable)
    .where(
      and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
    )
    .returning();
  if (!result) throw new Error("Failed to permanently delete note");
  return { ...result, labels: [], images: [] };
}

export async function reorderNotes(
  userId: string,
  orderedIds: number[],
) {
  return db.transaction(async (tx) => {
    await Promise.all(
      orderedIds.map((id, index) =>
        tx
          .update(notesTable)
          .set({ sortOrder: index })
          .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
      ),
    );
  });
}

async function setNoteLabelsTx(
  tx: any,
  noteId: number,
  labelIds: number[],
  userId: string,
) {
  await tx
    .delete(noteLabels)
    .where(eq(noteLabels.noteId, noteId));

  if (labelIds.length > 0) {
    const owned = await tx
      .select({ id: labels.id })
      .from(labels)
      .where(
        and(inArray(labels.id, labelIds), eq(labels.userId, userId)),
      );
    const ownedIds = owned.map((l: { id: number }) => l.id);
    if (ownedIds.length > 0) {
      await tx
        .insert(noteLabels)
        .values(ownedIds.map((labelId: number) => ({ noteId, labelId })));
    }
  }
}

async function getNoteLabelsById(noteId: number) {
  return db
    .select({ id: labels.id, name: labels.name })
    .from(noteLabels)
    .innerJoin(labels, eq(noteLabels.labelId, labels.id))
    .where(eq(noteLabels.noteId, noteId));
}

async function getNoteLabelsByIdTx(tx: any, noteId: number) {
  return tx
    .select({ id: labels.id, name: labels.name })
    .from(noteLabels)
    .innerJoin(labels, eq(noteLabels.labelId, labels.id))
    .where(eq(noteLabels.noteId, noteId));
}

async function attachLabels(notesList: (typeof notesTable.$inferSelect)[]) {
  if (notesList.length === 0) return [];

  const ids = notesList.map((n) => n.id);
  const allNoteLabels = await db
    .select()
    .from(noteLabels)
    .innerJoin(labels, eq(noteLabels.labelId, labels.id))
    .where(inArray(noteLabels.noteId, ids));

  return notesList.map((note) => ({
    ...note,
    labels: allNoteLabels
      .filter((nl) => nl.note_labels.noteId === note.id)
      .map((nl) => ({ id: nl.labels.id, name: nl.labels.name })),
  }));
}

export async function createNoteImage(image: NewNoteImage) {
  const [result] = await db.insert(noteImages).values(image).returning();
  return result;
}

export async function getNoteImages(noteId: number) {
  return db
    .select()
    .from(noteImages)
    .where(eq(noteImages.noteId, noteId))
    .orderBy(noteImages.createdAt);
}

export async function getNoteImageById(id: number) {
  const [result] = await db
    .select()
    .from(noteImages)
    .where(eq(noteImages.id, id));
  return result;
}

export async function deleteNoteImageRecord(id: number) {
  const [result] = await db
    .delete(noteImages)
    .where(eq(noteImages.id, id))
    .returning();
  return result;
}

export async function getNoteImagesByNoteId(noteId: number) {
  return db
    .select()
    .from(noteImages)
    .where(eq(noteImages.noteId, noteId));
}

async function attachImages(notesList: any[]) {
  if (notesList.length === 0) return [];

  const ids = notesList.map((n: any) => n.id);
  const allImages = await db
    .select()
    .from(noteImages)
    .where(inArray(noteImages.noteId, ids));

  const storage = getStorage();
  const notesWithImages = await Promise.all(
    notesList.map(async (note: any) => {
      const images = allImages.filter((img) => img.noteId === note.id);
      const imagesWithUrls = await Promise.all(
        images.map(async (img) => {
          const presignedUrl = storage
            ? await storage.getSignedUrl(img.key)
            : "";
          return {
            id: img.id,
            noteId: img.noteId,
            key: img.key,
            filename: img.filename,
            mimeType: img.mimeType,
            size: img.size,
            width: img.width,
            height: img.height,
            presignedUrl,
            createdAt: img.createdAt,
            updatedAt: img.updatedAt,
          };
        }),
      );
      return { ...note, images: imagesWithUrls };
    }),
  );

  return notesWithImages;
}
