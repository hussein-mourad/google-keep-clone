import { serial, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { withTimestamps } from "./timestamps";

export const notesTable = pgTable("notes", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  ...withTimestamps,
});

export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;
