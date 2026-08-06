import type { NoteChecklistItem } from "./types";

function uid(): string {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createChecklistItem(): NoteChecklistItem {
	return { id: uid(), text: "", checked: false };
}

export function contentToItems(content: string): NoteChecklistItem[] {
	return content
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => ({ ...createChecklistItem(), text: line }));
}

export function itemsToContent(items: NoteChecklistItem[]): string {
	return items.map((item) => item.text).join("\n");
}
