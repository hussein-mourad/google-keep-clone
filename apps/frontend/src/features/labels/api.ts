import api from "#/lib/api";
import type { Label } from "./types";

export async function getLabels(): Promise<Label[]> {
	const { data } = await api.get("/api/labels");
	return data;
}

export async function createLabel(name: string): Promise<Label> {
	const { data } = await api.post("/api/labels", { name });
	return data;
}

export async function updateLabel(
	id: number,
	name: string,
): Promise<Label> {
	const { data } = await api.put(`/api/labels/${id}`, { name });
	return data;
}

export async function deleteLabel(id: number): Promise<Label> {
	const { data } = await api.delete(`/api/labels/${id}`);
	return data;
}
