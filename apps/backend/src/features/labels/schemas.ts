import { z } from "zod";

const labelNameSchema = z.string().trim().min(1).max(255);

export const createLabelSchema = z.object({
  name: labelNameSchema,
});

export const updateLabelSchema = z.object({
  name: labelNameSchema,
});

export type CreateLabelBody = z.infer<typeof createLabelSchema>;
export type UpdateLabelBody = z.infer<typeof updateLabelSchema>;
