import express from "express";
var router = express.Router();
import * as controller from "./controller";

router.get("/", controller.getLabels);
router.post("/", controller.createLabel);
router.put("/:id", controller.updateLabel);
router.delete("/:id", controller.deleteLabel);

export default router;
