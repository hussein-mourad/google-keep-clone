import type { Label } from "#/features/labels/types";

export interface NoteImage {
	id: number;
	noteId: number;
	key: string;
	filename: string;
	mimeType: string;
	size: number;
	width: number | null;
	height: number | null;
	presignedUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface Note {
	id: number;
	title: string;
	content: string;
	color: string | null;
	isPinned: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	deletedAt: string | null;
	labels: Label[];
	images: NoteImage[];
	createdAt: string;
	updatedAt: string;
}
