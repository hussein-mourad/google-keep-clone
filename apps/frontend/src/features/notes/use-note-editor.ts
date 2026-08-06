import { useState } from "react";
import { toast } from "sonner";
import { deleteNoteImage } from "./api";
import { contentToItems, itemsToContent } from "./checklist-utils";
import type { NoteChecklistItem, NoteImage } from "./types";

interface UseNoteEditorOptions {
	initialLabelIds?: number[];
	initialColor?: string | null;
	initialIsChecklist?: boolean;
	initialChecklist?: NoteChecklistItem[];
	initialImages?: NoteImage[];
}

interface ToggleChecklistParams {
	isChecklist: boolean;
	checklist: NoteChecklistItem[];
	setChecklist: (items: NoteChecklistItem[]) => void;
	setIsChecklist: (value: boolean) => void;
	getValues: () => { title?: string; content?: string };
	setValue: (name: "content", value: string) => void;
}

export function toggleChecklistMode({
	isChecklist,
	checklist,
	setChecklist,
	setIsChecklist,
	getValues,
	setValue,
}: ToggleChecklistParams) {
	if (isChecklist) {
		setValue("content", itemsToContent(checklist));
		setChecklist([]);
		setIsChecklist(false);
	} else {
		const { content = "" } = getValues();
		setChecklist(contentToItems(content));
		setValue("content", "");
		setIsChecklist(true);
	}
}

export function useNoteEditor(options: UseNoteEditorOptions = {}) {
	const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(
		options.initialLabelIds ?? [],
	);
	const [selectedColor, setSelectedColor] = useState<string | null>(
		options.initialColor ?? null,
	);
	const [isChecklist, setIsChecklist] = useState(
		options.initialIsChecklist ?? false,
	);
	const [checklist, setChecklist] = useState<NoteChecklistItem[]>(
		options.initialChecklist ?? [],
	);
	const [images, setImages] = useState<NoteImage[]>(
		options.initialImages ?? [],
	);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showLabelPicker, setShowLabelPicker] = useState(false);

	async function handleRemoveImage(imageId: number) {
		try {
			await deleteNoteImage(imageId);
			setImages((prev) => prev.filter((img) => img.id !== imageId));
		} catch {
			toast.error("Failed to delete image");
		}
	}

	return {
		selectedLabelIds,
		setSelectedLabelIds,
		selectedColor,
		setSelectedColor,
		isChecklist,
		setIsChecklist,
		checklist,
		setChecklist,
		images,
		setImages,
		showColorPicker,
		setShowColorPicker,
		showLabelPicker,
		setShowLabelPicker,
		handleRemoveImage,
	};
}
