import api from "#/lib/api";
import type { Note } from "./types";

export async function getNotes(labelId?: number): Promise<Note[]> {
	const params = labelId ? { params: { labelId } } : {};
	const { data } = await api.get("/api/notes", params);
	return data;
}

export async function getNote(id: number): Promise<Note> {
	const { data } = await api.get(`/api/notes/${id}`);
	return data;
}

export async function createNote(note: {
	title: string;
	content: string;
	labelIds?: number[];
}): Promise<Note> {
	const { data } = await api.post("/api/notes", note);
	return data;
}

export async function updateNote(
	id: number,
	note: { title: string; content: string; labelIds?: number[] },
): Promise<Note> {
	const { data } = await api.put(`/api/notes/${id}`, note);
	return data;
}

export async function deleteNote(id: number): Promise<Note> {
	const { data } = await api.delete(`/api/notes/${id}`);
	return data;
}
