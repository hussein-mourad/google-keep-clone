import type { Note } from "./types";

export function noteToMarkdown(note: Note): string {
	const parts: string[] = [];

	if (note.title) {
		parts.push(`# ${note.title}`, "");
	}

	if (note.isChecklist && Array.isArray(note.checklist)) {
		parts.push("## Checklist", "");
		for (const item of note.checklist) {
			parts.push(`- [${item.checked ? "x" : " "}] ${item.text}`);
		}
		parts.push("");
	} else if (note.content) {
		parts.push(note.content, "");
	}

	if (note.images && note.images.length > 0) {
		parts.push("## Images", "");
		for (const image of note.images) {
			parts.push(`![${image.filename}](${image.presignedUrl})`, "");
		}
	}

	if (note.labels && note.labels.length > 0) {
		parts.push(note.labels.map((label) => `#${label.name}`).join(" "), "");
	}

	return parts.join("\n").trim();
}

export function downloadMarkdown(note: Note): void {
	const filename = `${(note.title || "note").replace(/[^\w-]+/g, "-")}.md`;
	const blob = new Blob([noteToMarkdown(note)], {
		type: "text/markdown;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
