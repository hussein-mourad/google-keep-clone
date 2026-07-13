import { integer, pgTable, primaryKey, serial, text, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { notesTable } from "./notes";
import { withTimestamps } from "./timestamps";

export const labels = pgTable("labels", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...withTimestamps,
});

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

export const noteLabels = pgTable(
  "note_labels",
  {
    noteId: integer("note_id")
      .notNull()
      .references(() => notesTable.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.noteId, t.labelId] })],
);

export type NoteLabel = typeof noteLabels.$inferSelect;
export type NewNoteLabel = typeof noteLabels.$inferInsert;
