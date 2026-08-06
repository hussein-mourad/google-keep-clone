import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { DrizzleClient } from "../../db/types";
import { db } from "../../db";
import { noteImages, type NewNoteImage, type NoteImage } from "../../db/schema/note-images";
import { notesTable, type NewNote, type NoteChecklistItem } from "../../db/schema/notes";
import { labels, noteLabels } from "../../db/schema/labels";
import { getStorage, type StorageProvider } from "../../lib/storage";
import { setNoteLabelsTx } from "../labels/service";

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
  const imagesWithUrls = await mapImagesWithUrls(images, getStorage());
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

    const noteLabelsResult = await getNoteLabelsById(result.id, tx);
    return { ...result, labels: noteLabelsResult, images: [] };
  });
}

export async function duplicateNote(id: number, userId: string) {
  const [source] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)));
  if (!source) return undefined;

  const labelIds = (await getNoteLabelsById(source.id)).map(
    (label) => label.id,
  );
  const title = source.title ? `Copy of ${source.title}` : "";

  return createNote(
    {
      title,
      content: source.content,
      userId,
      color: source.color,
      isChecklist: source.isChecklist,
      checklist: source.checklist,
    },
    labelIds,
    userId,
  );
}

export async function emptyTrash(userId: string) {
  const trashed = await db
    .select({ id: notesTable.id })
    .from(notesTable)
    .where(
      and(eq(notesTable.userId, userId), eq(notesTable.isDeleted, true)),
    );
  const ids = trashed.map((n) => n.id);
  if (ids.length === 0) return 0;

  const images = await db
    .select()
    .from(noteImages)
    .where(inArray(noteImages.noteId, ids));
  const storage = getStorage();
  if (storage) {
    await Promise.allSettled(images.map((img) => storage.delete(img.key)));
  }

  await db.delete(noteLabels).where(inArray(noteLabels.noteId, ids));
  await db.delete(noteImages).where(inArray(noteImages.noteId, ids));
  await db.delete(notesTable).where(
    and(eq(notesTable.userId, userId), eq(notesTable.isDeleted, true)),
  );
  return ids.length;
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

    const noteLabelsResult = await getNoteLabelsById(id, tx);
    const noteImagesResult = await getNoteImages(id, tx);
    const imagesWithUrls = await mapImagesWithUrls(
      noteImagesResult,
      getStorage(),
    );
    return { ...result, labels: noteLabelsResult, images: imagesWithUrls };
  });
}

export async function softDeleteNote(id: number, userId: string) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .update(notesTable)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(
        and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
      )
      .returning();
    if (!result) throw new Error("Failed to delete note");
    const noteLabelsResult = await getNoteLabelsById(result.id, tx);
    return { ...result, labels: noteLabelsResult, images: [] };
  });
}

export async function restoreNote(id: number, userId: string) {
  return db.transaction(async (tx) => {
    const [result] = await tx
      .update(notesTable)
      .set({ isDeleted: false, deletedAt: null, isArchived: false })
      .where(
        and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
      )
      .returning();
    if (!result) throw new Error("Failed to restore note");
    const noteLabelsResult = await getNoteLabelsById(result.id, tx);
    return { ...result, labels: noteLabelsResult, images: [] };
  });
}

export async function permanentDeleteNote(id: number, userId: string) {
  const images = await getNoteImagesByNoteId(id);
  const storage = getStorage();
  if (storage) {
    await Promise.allSettled(
      images.map((img) => storage.delete(img.key)),
    );
  }

  return db.transaction(async (tx) => {
    const [result] = await tx
      .delete(notesTable)
      .where(
        and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
      )
      .returning();
    if (!result) throw new Error("Failed to permanently delete note");
    return { ...result, labels: [], images: [] };
  });
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

async function getNoteLabelsById(noteId: number, client: DrizzleClient = db) {
  return client
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

export async function getNoteImages(
  noteId: number,
  client: DrizzleClient = db,
) {
  return client
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

async function mapImagesWithUrls(
  images: NoteImage[],
  storage: StorageProvider | null,
) {
  return Promise.all(
    images.map(async (img) => {
      const presignedUrl = storage
        ? await storage.getSignedUrl(img.key)
        : "";
      return { ...img, presignedUrl };
    }),
  );
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
      const imagesWithUrls = await mapImagesWithUrls(images, storage);
      return { ...note, images: imagesWithUrls };
    }),
  );

  return notesWithImages;
}
