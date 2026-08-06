import { z } from "zod";
import type { NoteChecklistItem } from "../../db/schema/notes";

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable();

export const checklistSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      text: z.string(),
      checked: z.boolean().optional(),
    }),
  )
  .transform((items): NoteChecklistItem[] =>
    items.map((item, index) => ({
      id: item.id ?? `item-${index}`,
      text: item.text,
      checked: item.checked === true,
    })),
  );

export const createNoteSchema = z.object({
  title: z.string().max(255).optional().default(""),
  content: z.string().optional().default(""),
  color: hexColorSchema.optional().default(null),
  labelIds: z.array(z.number().int().positive()).optional(),
  isPinned: z.boolean().optional(),
  isChecklist: z.boolean().optional().default(false),
  checklist: checklistSchema.optional().default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  color: hexColorSchema.optional(),
  labelIds: z.array(z.number().int().positive()).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isChecklist: z.boolean().optional(),
  checklist: checklistSchema.optional(),
});

export const getNotesQuerySchema = z
  .object({
    labelId: z.coerce.number().int().positive().optional(),
    search: z.string().optional(),
    archived: z.literal("true").optional(),
    trash: z.literal("true").optional(),
  })
  .transform((value) => ({
    labelId: value.labelId,
    search: value.search,
    archived: value.archived === "true",
    trash: value.trash === "true",
  }));

export const reorderNotesSchema = z.object({
  orderedIds: z.array(z.number().int()).min(1),
});

export type CreateNoteBody = z.infer<typeof createNoteSchema>;
export type UpdateNoteBody = z.infer<typeof updateNoteSchema>;
export type GetNotesQuery = z.infer<typeof getNotesQuerySchema>;
export type ReorderNotesBody = z.infer<typeof reorderNotesSchema>;
