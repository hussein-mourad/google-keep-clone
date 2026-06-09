import type { Request, Response } from "express";
import * as service from "./service";

export async function getNotes(req: Request, res: Response) {
  const notes = await service.getNotes();
  res.json(notes);
}

export async function createNote(req: Request, res: Response) {
  const note = req.body;
  const createdNote = await service.createNote(note);
  res.json(createdNote);
}

export async function getNote(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id is required" });
  const note = await service.getNote(+id);
  res.json(note);
}

export async function updateNote(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id is required" });
  const note = req.body;
  const updatedNote = await service.updateNote(+id, note.title, note.content);
  res.json(updatedNote);
}

export async function deleteNote(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id is required" });
  const deletedNote = await service.deleteNote(+id);
  res.json(deletedNote);
}
