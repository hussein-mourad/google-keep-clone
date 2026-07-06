import type { Request, Response } from "express";
import * as service from "./service";

export async function getNotes(req: Request, res: Response) {
  try {
    const notes = await service.getNotes();
    res.json(notes);
  } catch (error) {
    return res.status(404).json({ error: "Failed to get notes" });
  }
}

export async function createNote(req: Request, res: Response) {
  try {
    const note = req.body;
    const { title, content } = note;
    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }
    if (!content) {
      return res.status(400).json({
        message: "Content is required",
      });
    }
    const createdNote = await service.createNote(note);
    res.json(createdNote);
  } catch (error) {
    res.status(400).json({ error: "Failed to create note" });
  }
}

export async function getNote(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id is required" });
  const note = await service.getNote(+id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
}

export async function updateNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const note = req.body;
    const noteDB = await service.getNote(+id);
    if (!noteDB) return res.status(404).json({ error: "Note not found" });
    const updatedNote = await service.updateNote(+id, note.title, note.content);
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: "Failed to update note" });
  }
}

export async function deleteNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const note = await service.getNote(+id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    const deletedNote = await service.deleteNote(+id);
    res.json(deletedNote);
  } catch (error) {
    res.status(400).json({ error: "Failed to delete note" });
  }
}
