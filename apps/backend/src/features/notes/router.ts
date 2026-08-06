import express from "express";
import { idParamsSchema, imageIdParamsSchema } from "../../lib/param-schemas";
import { validate } from "../../lib/validate";
import * as controller from "./controller";
import { uploadImage } from "./middleware";
import {
  createNoteSchema,
  getNotesQuerySchema,
  reorderNotesSchema,
  updateNoteSchema,
} from "./schemas";

const router = express.Router();

router.get("/", validate(getNotesQuerySchema, "query"), controller.getNotes);
router.post("/", validate(createNoteSchema), controller.createNote);
router.put("/reorder", validate(reorderNotesSchema), controller.reorderNotes);
router.get("/:id", validate(idParamsSchema, "params"), controller.getNote);
router.put(
  "/:id",
  validate(idParamsSchema, "params"),
  validate(updateNoteSchema),
  controller.updateNote,
);
router.patch(
  "/:id/trash",
  validate(idParamsSchema, "params"),
  controller.trashNote,
);
router.patch(
  "/:id/restore",
  validate(idParamsSchema, "params"),
  controller.restoreNote,
);
router.delete(
  "/:id",
  validate(idParamsSchema, "params"),
  controller.permanentDeleteNote,
);
router.post(
  "/:id/images",
  validate(idParamsSchema, "params"),
  uploadImage.single("image"),
  controller.uploadNoteImage,
);
router.delete(
  "/images/:imageId",
  validate(imageIdParamsSchema, "params"),
  controller.deleteNoteImage,
);

export default router;
