import type { Request, Response } from "express";
import { AppError } from "../../lib/http-error";
import { getUserId } from "../auth/middleware";
import type { CreateLabelBody, UpdateLabelBody } from "./schemas";
import * as service from "./service";

export async function getLabels(req: Request, res: Response) {
  const userId = getUserId(req);
  const result = await service.getLabels(userId);
  res.json(result);
}

export async function createLabel(req: Request, res: Response) {
  const userId = getUserId(req);
  const { name } = req.body as CreateLabelBody;
  const label = await service.createLabel(name, userId);
  res.json(label);
}

export async function getLabel(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const label = await service.getLabel(id, userId);
  if (!label) throw new AppError(404, "NOT_FOUND", "Label not found");
  res.json(label);
}

export async function updateLabel(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const { name } = req.body as UpdateLabelBody;
  const existing = await service.getLabel(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Label not found");
  const label = await service.updateLabel(id, name, userId);
  res.json(label);
}

export async function deleteLabel(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const existing = await service.getLabel(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Label not found");
  const label = await service.deleteLabel(id, userId);
  res.json(label);
}
