import express from "express";
const router = express.Router();
import * as controller from "./controller";

router.get("/", controller.getLabels);
router.post("/", controller.createLabel);
router.get("/:id", controller.getLabel);
router.put("/:id", controller.updateLabel);
router.delete("/:id", controller.deleteLabel);

export default router;
