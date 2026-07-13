import type { Label } from "#/features/labels/types";

export interface Note {
	id: number;
	title: string;
	content: string;
	labels: Label[];
	createdAt: string;
	updatedAt: string;
}
