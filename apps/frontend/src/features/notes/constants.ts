import { z } from "zod";

export const NOTE_COLORS = [
	{ name: "Default", value: null },
	{ name: "Red", value: "#f28b82" },
	{ name: "Orange", value: "#fbbc04" },
	{ name: "Yellow", value: "#fff475" },
	{ name: "Green", value: "#ccff90" },
	{ name: "Teal", value: "#a7ffeb" },
	{ name: "Blue", value: "#cbf0f8" },
	{ name: "Purple", value: "#d7aefb" },
	{ name: "Pink", value: "#fdcfe8" },
];

export const noteSchema = z.object({
	title: z.string().optional(),
	content: z.string().optional(),
});

export type NoteFormData = z.infer<typeof noteSchema>;

export const SAVE_DEBOUNCE_MS = 600;
