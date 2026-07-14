import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { notesTable, type NewNote } from "../../db/schema/notes";
import { noteLabels, labels } from "../../db/schema/labels";

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
      sql`(${ilike(notesTable.title, `%${search}%`)} OR ${ilike(notesTable.content, `%${search}%`)})`,
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
    .orderBy(desc(notesTable.isPinned), desc(notesTable.updatedAt));

  return attachLabels(notes);
}

export async function getNote(id: number, userId: string) {
  const [note] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)));
  if (!note) return undefined;
  const noteLabelsResult = await getNoteLabelsById(note.id);
  return { ...note, labels: noteLabelsResult };
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
    return { ...result, labels: noteLabelsResult };
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
    return { ...result, labels: noteLabelsResult };
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
  return { ...result, labels: noteLabelsResult };
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
  return { ...result, labels: noteLabelsResult };
}

export async function permanentDeleteNote(id: number, userId: string) {
  const [result] = await db
    .delete(notesTable)
    .where(
      and(eq(notesTable.id, id), eq(notesTable.userId, userId)),
    )
    .returning();
  if (!result) throw new Error("Failed to permanently delete note");
  return { ...result, labels: [] };
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
