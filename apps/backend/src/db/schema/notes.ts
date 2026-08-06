import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { withTimestamps } from "./timestamps";

export interface NoteChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export const notesTable = pgTable(
  "notes",
  {
    id: serial().primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    isPinned: boolean("is_pinned").default(false).notNull(),
    color: varchar("color", { length: 7 }),
    isArchived: boolean("is_archived").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at"),
    sortOrder: integer("sort_order").default(0).notNull(),

    isChecklist: boolean("is_checklist").default(false).notNull(),
    checklist: jsonb("checklist")
      .$type<NoteChecklistItem[]>()
      .default([])
      .notNull(),

    ...withTimestamps,
  },
  (table) => [
    index("notes_user_id_idx").on(table.userId),
    index("notes_pinned_sort_idx").on(table.isPinned, table.sortOrder),
  ],
);

export type Note = typeof notesTable.$inferSelect;
export type NewNote = typeof notesTable.$inferInsert;
