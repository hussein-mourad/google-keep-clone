import { eq } from "drizzle-orm";
import { db } from "../../db";
import { notesTable, type NewNote, type Note } from "../../db/schema/notes";

export async function getNote(id: number) {
  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, id));
  return note;
}

export async function getNotes() {
  return db.select().from(notesTable);
}

export async function createNote(note: NewNote) {
  const [result] = await db.insert(notesTable).values(note).returning();
  if (!result) throw new Error("Failed to create note");
  return result;
}

export async function updateNote(id: number, title: string, content: string) {
  const [result] = await db
    .update(notesTable)
    .set({ title, content })
    .where(eq(notesTable.id, id))
    .returning();
  if (!result) throw new Error("Failed to update note");
  return result;
}

export async function deleteNote(id: number) {
  const [result] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, id))
    .returning();
  if (!result) throw new Error("Failed to delete note");
  return result;
}
