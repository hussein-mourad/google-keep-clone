import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { notesTable, type NewNote } from "../../db/schema/notes";

export async function getNotes(userId: string) {
  return db
    .select()
    .from(notesTable)
    .where(eq(notesTable.userId, userId));
}

export async function getNote(id: number, userId: string) {
  const [note] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)));
  return note;
}

export async function createNote(note: NewNote) {
  const [result] = await db.insert(notesTable).values(note).returning();
  if (!result) throw new Error("Failed to create note");
  return result;
}

export async function updateNote(id: number, title: string, content: string, userId: string) {
  const [result] = await db
    .update(notesTable)
    .set({ title, content })
    .where(
      and(eq(notesTable.id, id), eq(notesTable.userId, userId))
    )
    .returning();
  if (!result) throw new Error("Failed to update note");
  return result;
}

export async function deleteNote(id: number, userId: string) {
  const [result] = await db
    .delete(notesTable)
    .where(
      and(eq(notesTable.id, id), eq(notesTable.userId, userId))
    )
    .returning();
  if (!result) throw new Error("Failed to delete note");
  return result;
}
