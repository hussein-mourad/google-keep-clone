import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
import { noteImages } from "./note-images";
import { notesTable } from "./notes";
import { labels, noteLabels } from "./labels";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  notes: many(notesTable),
  labels: many(labels),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const notesRelations = relations(notesTable, ({ one, many }) => ({
  user: one(user, {
    fields: [notesTable.userId],
    references: [user.id],
  }),
  noteLabels: many(noteLabels),
  noteImages: many(noteImages),
}));

export const noteImagesRelations = relations(noteImages, ({ one }) => ({
  note: one(notesTable, {
    fields: [noteImages.noteId],
    references: [notesTable.id],
  }),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  user: one(user, {
    fields: [labels.userId],
    references: [user.id],
  }),
  noteLabels: many(noteLabels),
}));

export const noteLabelsRelations = relations(noteLabels, ({ one }) => ({
  note: one(notesTable, {
    fields: [noteLabels.noteId],
    references: [notesTable.id],
  }),
  label: one(labels, {
    fields: [noteLabels.labelId],
    references: [labels.id],
  }),
}));
