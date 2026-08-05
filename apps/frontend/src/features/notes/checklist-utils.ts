import { createChecklistItem } from "./components/checklist-editor";
import type { NoteChecklistItem } from "./types";

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
