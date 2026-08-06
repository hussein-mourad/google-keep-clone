import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { notesTable } from "./notes";
import { withTimestamps } from "./timestamps";

export const noteImages = pgTable(
  "note_images",
  {
    id: serial().primaryKey(),
    noteId: integer("note_id")
      .notNull()
      .references(() => notesTable.id, { onDelete: "cascade" }),
    key: varchar({ length: 512 }).notNull(),
    filename: varchar({ length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer().notNull(),
    width: integer(),
    height: integer(),
    ...withTimestamps,
  },
  (table) => [index("note_images_note_id_idx").on(table.noteId)],
);

export type NoteImage = typeof noteImages.$inferSelect;
export type NewNoteImage = typeof noteImages.$inferInsert;
