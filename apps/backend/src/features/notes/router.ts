import express from "express";
const router = express.Router();
import * as controller from "./controller";

router.get("/", controller.getNotes);
router.post("/", controller.createNote);
router.put("/reorder", controller.reorderNotes);
router.get("/:id", controller.getNote);
router.put("/:id", controller.updateNote);
router.patch("/:id/trash", controller.trashNote);
router.patch("/:id/restore", controller.restoreNote);
router.delete("/:id", controller.permanentDeleteNote);

export default router;
