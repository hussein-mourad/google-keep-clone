import express from "express";
var router = express.Router();
import * as controller from "./controller";

router.get("/", controller.getNotes);
router.post("/", controller.createNote);
router.get("/:id", controller.getNote);
router.put("/:id", controller.updateNote);
router.delete("/:id", controller.deleteNote);

export default router;
