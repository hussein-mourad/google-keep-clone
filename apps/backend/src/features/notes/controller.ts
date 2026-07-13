import type { Request, Response } from "express";
import * as service from "./service";

export async function getNotes(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const raw = req.query.labelId;
    const labelId =
      raw && !Number.isNaN(Number(raw)) ? Number(raw) : undefined;
    const notes = await service.getNotes(userId, labelId);
    res.json(notes);
  } catch (error) {
    return res.status(500).json({ error });
  }
}

export async function createNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { title, content, labelIds } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    const note = await service.createNote(
      { title, content, userId },
      labelIds,
      userId,
    );
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: "Failed to create note" });
  }
}

export async function getNote(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id is required" });
  const note = await service.getNote(+id, userId);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
}

export async function updateNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const { title, content, labelIds } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    const note = await service.getNote(+id, userId);
    if (!note) return res.status(404).json({ error: "Note not found" });
    const updatedNote = await service.updateNote(
      +id,
      title,
      content,
      userId,
      labelIds,
    );
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: "Failed to update note" });
  }
}

export async function deleteNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const note = await service.getNote(+id, userId);
    if (!note) return res.status(404).json({ error: "Note not found" });
    const deletedNote = await service.deleteNote(+id, userId);
    res.json(deletedNote);
  } catch (error) {
    res.status(400).json({ error: "Failed to delete note" });
  }
}
