import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const imageIdParamsSchema = z.object({
  imageId: z.coerce.number().int().positive(),
});
