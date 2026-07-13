import { text, pgTable, varchar, serial } from "drizzle-orm/pg-core";
import { withTimestamps } from "./timestamps";

export const notesTable = pgTable("notes", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),

  ...withTimestamps,
});

export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;
