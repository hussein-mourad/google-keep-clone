import type { Request, Response } from "express";
import * as service from "./service";

export async function getLabels(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const result = await service.getLabels(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch labels" });
  }
}

export async function createLabel(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const label = await service.createLabel(name, userId);
    res.json(label);
  } catch (error) {
    res.status(400).json({ error: "Failed to create label" });
  }
}

export async function getLabel(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const label = await service.getLabel(+id, userId);
    if (!label) return res.status(404).json({ error: "Label not found" });
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch label" });
  }
}

export async function updateLabel(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const existing = await service.getLabel(+id, userId);
    if (!existing) return res.status(404).json({ error: "Label not found" });
    const label = await service.updateLabel(+id, name, userId);
    res.json(label);
  } catch (error) {
    res.status(400).json({ error: "Failed to update label" });
  }
}

export async function deleteLabel(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await service.getLabel(+id, userId);
    if (!existing) return res.status(404).json({ error: "Label not found" });
    const label = await service.deleteLabel(+id, userId);
    res.json(label);
  } catch (error) {
    res.status(400).json({ error: "Failed to delete label" });
  }
}
