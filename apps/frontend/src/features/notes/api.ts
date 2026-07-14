import api from "#/lib/api";
import type { Note } from "./types";

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

export async function createNote(note: {
	title: string;
	content: string;
	color?: string | null;
	labelIds?: number[];
	isPinned?: boolean;
}): Promise<Note> {
	const { data } = await api.post("/api/notes", note);
	return data;
}

export async function updateNote(
	id: number,
	note: {
		title?: string;
		content?: string;
		isPinned?: boolean;
		isArchived?: boolean;
		color?: string | null;
		labelIds?: number[];
	},
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

export async function reorderNotes(orderedIds: number[]): Promise<void> {
	await api.put("/api/notes/reorder", { orderedIds });
}
