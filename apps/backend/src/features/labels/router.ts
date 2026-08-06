import express from "express";
import { idParamsSchema } from "../../lib/param-schemas";
import { validate } from "../../lib/validate";
import * as controller from "./controller";
import { createLabelSchema, updateLabelSchema } from "./schemas";

const router = express.Router();

router.get("/", controller.getLabels);
router.post("/", validate(createLabelSchema), controller.createLabel);
router.get("/:id", validate(idParamsSchema, "params"), controller.getLabel);
router.put(
  "/:id",
  validate(idParamsSchema, "params"),
  validate(updateLabelSchema),
  controller.updateLabel,
);
router.delete(
  "/:id",
  validate(idParamsSchema, "params"),
  controller.deleteLabel,
);

export default router;
