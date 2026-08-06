import api from "#/lib/api";
import type {
	CreateNoteInput,
	Note,
	NoteImage,
	UpdateNoteInput,
} from "./types";

export async function getNotes(opts?: {
	labelId?: number;
	search?: string;
	archived?: boolean;
	trash?: boolean;
}): Promise<Note[]> {
	const params: Record<string, string> = {};
	if (opts?.labelId) params.labelId = String(opts.labelId);
	if (opts?.search) params.search = opts.search;
	if (opts?.archived) params.archived = "true";
	if (opts?.trash) params.trash = "true";
	const { data } = await api.get("/api/notes", { params });
	return data;
}

export async function getNote(id: number): Promise<Note> {
	const { data } = await api.get(`/api/notes/${id}`);
	return data;
}

export async function createNote(note: CreateNoteInput): Promise<Note> {
	const { data } = await api.post("/api/notes", note);
	return data;
}

export async function updateNote(
	id: number,
	note: UpdateNoteInput,
): Promise<Note> {
	const { data } = await api.put(`/api/notes/${id}`, note);
	return data;
}

export async function trashNote(id: number): Promise<Note> {
	const { data } = await api.patch(`/api/notes/${id}/trash`);
	return data;
}

export async function restoreNote(id: number): Promise<Note> {
	const { data } = await api.patch(`/api/notes/${id}/restore`);
	return data;
}

export async function permanentDeleteNote(id: number): Promise<Note> {
	const { data } = await api.delete(`/api/notes/${id}`);
	return data;
}

export async function uploadNoteImage(
	noteId: number,
	file: File,
	onProgress?: (progress: number) => void,
): Promise<NoteImage> {
	const formData = new FormData();
	formData.append("image", file);
	const { data } = await api.post(`/api/notes/${noteId}/images`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
		onUploadProgress: onProgress
			? (e) => {
					if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
				}
			: undefined,
	});
	return data;
}

export async function deleteNoteImage(imageId: number): Promise<void> {
	await api.delete(`/api/notes/images/${imageId}`);
}

export async function reorderNotes(orderedIds: number[]): Promise<void> {
	await api.put("/api/notes/reorder", { orderedIds });
}
