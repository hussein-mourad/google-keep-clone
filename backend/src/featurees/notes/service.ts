import { eq } from "drizzle-orm";
import { db } from "../../db";
import { notesTable, NewNote } from "../../db/schema/notes";

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

export async function createNote(note: typeof NewNote) {}

export async function updateNote(id: number, title: string, content: string) {
  return { title, content };
}

export async function deleteNote(id: number) {
  return { id };
}
