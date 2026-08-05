import type { Request, Response } from "express";
import * as service from "./service";
import { getStorage, generateImageKey } from "../../lib/storage";

export async function getNotes(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const raw = req.query.labelId;
    const labelId =
      raw && !Number.isNaN(Number(raw)) ? Number(raw) : undefined;
    const search = req.query.search as string | undefined;
    const archived = req.query.archived === "true";
    const trash = req.query.trash === "true";

    const notes = await service.getNotes(userId, { labelId, search, archived, trash });
    res.json(notes);
  } catch (error) {
    return res.status(500).json({ error });
  }
}

export async function createNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { title, content, labelIds, color } = req.body;
    const note = await service.createNote(
      { title: title ?? "", content: content ?? "", userId, color: color ?? null },
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

    const { title, content, labelIds, isPinned, color, isArchived } = req.body;
    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (isPinned !== undefined) data.isPinned = isPinned;
    if (color !== undefined) data.color = color;
    if (isArchived !== undefined) data.isArchived = isArchived;

    const existing = await service.getNote(+id, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });
    if (existing.isDeleted) {
      return res.status(400).json({ error: "Cannot update a trashed note" });
    }

    const updated = await service.updateNote(+id, userId, data, labelIds);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update note" });
  }
}

export async function trashNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await service.getNote(+id, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });
    const result = await service.softDeleteNote(+id, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "Failed to trash note" });
  }
}

export async function restoreNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await service.getNote(+id, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });
    const result = await service.restoreNote(+id, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "Failed to restore note" });
  }
}

export async function permanentDeleteNote(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const existing = await service.getNote(+id, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });
    const result = await service.permanentDeleteNote(+id, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "Failed to delete note" });
  }
}

export async function uploadNoteImage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const existing = await service.getNote(+id, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });

    const storage = getStorage();
    if (!storage) {
      return res.status(503).json({ error: "Image storage not configured" });
    }

    const key = generateImageKey(userId, +id, file.originalname);
    await storage.upload(key, file.buffer, file.mimetype);

    const image = await service.createNoteImage({
      noteId: +id,
      key,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: null,
      height: null,
    });

    const presignedUrl = await storage.getSignedUrl(key);
    res.json({ ...image, presignedUrl });
  } catch (error: any) {
    if (error?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    }
    if (error?.message?.startsWith("Invalid file type")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: "Failed to upload image" });
  }
}

export async function deleteNoteImage(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { imageId } = req.params;
    if (!imageId) return res.status(400).json({ error: "imageId is required" });

    const image = await service.getNoteImageById(+imageId);
    if (!image) return res.status(404).json({ error: "Image not found" });

    const note = await service.getNote(image.noteId, userId);
    if (!note) return res.status(404).json({ error: "Image not found" });

    const storage = getStorage();
    if (storage) {
      await storage.delete(image.key);
    }

    await service.deleteNoteImageRecord(+imageId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete image" });
  }
}

export async function reorderNotes(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || !orderedIds.every((id: unknown) => typeof id === "number" && Number.isInteger(id))) {
      return res.status(400).json({ error: "orderedIds must be an array of numbers" });
    }
    await service.reorderNotes(userId, orderedIds);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Failed to reorder notes" });
  }
}
