import type { Request, Response } from "express";
import { AppError } from "../../lib/http-error";
import { generateImageKey, getStorage } from "../../lib/storage";
import { pickDefined } from "../../lib/validate";
import { getUserId } from "../auth/middleware";
import type {
  CreateNoteBody,
  GetNotesQuery,
  ReorderNotesBody,
  UpdateNoteBody,
} from "./schemas";
import * as service from "./service";

export async function getNotes(req: Request, res: Response) {
  const userId = getUserId(req);
  const query = req.query as unknown as GetNotesQuery;
  const notes = await service.getNotes(userId, query);
  res.json(notes);
}

export async function createNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const body = req.body as CreateNoteBody;
  const note = await service.createNote(
    {
      title: body.title,
      content: body.content,
      userId,
      color: body.color,
      isChecklist: body.isChecklist,
      checklist: body.checklist,
    },
    body.labelIds,
    userId,
  );
  res.json(note);
}

export async function getNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const note = await service.getNote(id, userId);
  if (!note) throw new AppError(404, "NOT_FOUND", "Note not found");
  res.json(note);
}

export async function updateNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const body = req.body as UpdateNoteBody;

  const existing = await service.getNote(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Note not found");
  if (existing.isDeleted) {
    throw new AppError(400, "TRASHED_NOTE", "Cannot update a trashed note");
  }

  const data = pickDefined({
    title: body.title,
    content: body.content,
    isPinned: body.isPinned,
    color: body.color,
    isArchived: body.isArchived,
    isChecklist: body.isChecklist,
    checklist: body.checklist,
  });

  const updated = await service.updateNote(id, userId, data, body.labelIds);
  res.json(updated);
}

export async function duplicateNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const note = await service.duplicateNote(id, userId);
  if (!note) throw new AppError(404, "NOT_FOUND", "Note not found");
  res.json(note);
}

export async function emptyTrash(req: Request, res: Response) {
  const userId = getUserId(req);
  const deletedCount = await service.emptyTrash(userId);
  res.json({ success: true, deletedCount });
}

export async function trashNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const existing = await service.getNote(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Note not found");
  const result = await service.softDeleteNote(id, userId);
  res.json(result);
}

export async function restoreNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const existing = await service.getNote(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Note not found");
  const result = await service.restoreNote(id, userId);
  res.json(result);
}

export async function permanentDeleteNote(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  const existing = await service.getNote(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Note not found");
  const result = await service.permanentDeleteNote(id, userId);
  res.json(result);
}

export async function uploadNoteImage(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = Number(req.params.id);

  const file = req.file;
  if (!file) throw new AppError(400, "NO_FILE", "No file provided");

  const existing = await service.getNote(id, userId);
  if (!existing) throw new AppError(404, "NOT_FOUND", "Note not found");

  const storage = getStorage();
  if (!storage) {
    throw new AppError(503, "STORAGE_UNAVAILABLE", "Image storage not configured");
  }

  const key = generateImageKey(userId, id, file.originalname);
  await storage.upload(key, file.buffer, file.mimetype);

  let image;
  try {
    image = await service.createNoteImage({
      noteId: id,
      key,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: null,
      height: null,
    });
  } catch (error) {
    // Don't orphan the S3 object if the DB insert fails.
    await storage.delete(key).catch(() => {});
    throw error;
  }

  const presignedUrl = await storage.getSignedUrl(key);
  res.json({ ...image, presignedUrl });
}

export async function deleteNoteImage(req: Request, res: Response) {
  const userId = getUserId(req);
  const imageId = Number(req.params.imageId);

  const image = await service.getNoteImageById(imageId);
  if (!image) throw new AppError(404, "NOT_FOUND", "Image not found");

  const note = await service.getNote(image.noteId, userId);
  if (!note) throw new AppError(404, "NOT_FOUND", "Image not found");

  const storage = getStorage();
  if (storage) {
    await storage.delete(image.key);
  }

  await service.deleteNoteImageRecord(imageId);
  res.status(204).end();
}

export async function reorderNotes(req: Request, res: Response) {
  const userId = getUserId(req);
  const body = req.body as ReorderNotesBody;
  await service.reorderNotes(userId, body.orderedIds);
  res.json({ success: true });
}
