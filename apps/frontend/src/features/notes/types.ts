import type { Label } from "#/features/labels/types";

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
	createdAt: string;
	updatedAt: string;
}
