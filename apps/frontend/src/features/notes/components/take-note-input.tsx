import { zodResolver } from "@hookform/resolvers/zod";
import {
	ImageIcon,
	ListChecksIcon,
	Loader2Icon,
	PaletteIcon,
	PinIcon,
	TagIcon,
	Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deleteNoteImage, permanentDeleteNote, uploadNoteImage } from "../api";
import { contentToItems, itemsToContent } from "../checklist-utils";
import type { Note, NoteChecklistItem, NoteImage } from "../types";
import { ChecklistEditor } from "./checklist-editor";
import { LabelPicker } from "./label-picker";

const noteSchema = z.object({
	title: z.string().optional(),
	content: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

const NOTE_COLORS = [
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

const SAVE_DEBOUNCE_MS = 600;

interface TakeNoteInputProps {
	onSubmit: (note: {
		title: string;
		content: string;
		labelIds: number[];
		color: string | null;
		isPinned?: boolean;
		isChecklist?: boolean;
		checklist?: NoteChecklistItem[];
	}) => Promise<Note>;
	onUpdate: (
		id: number,
		note: {
			title: string;
			content: string;
			labelIds: number[];
			color: string | null;
			isPinned?: boolean;
			isChecklist?: boolean;
			checklist?: NoteChecklistItem[];
		},
	) => Promise<void>;
}

export function TakeNoteInput({ onSubmit, onUpdate }: TakeNoteInputProps) {
	const [expanded, setExpanded] = useState(false);
	const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [isPinned, setIsPinned] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showLabelPicker, setShowLabelPicker] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [images, setImages] = useState<NoteImage[]>([]);
	const [isChecklist, setIsChecklist] = useState(false);
	const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
	const noteIdRef = useRef<number | null>(null);
	const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closingRef = useRef(false);
	const mouseDownInsideRef = useRef(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { register, handleSubmit, getValues, reset, watch, setValue } =
		useForm<NoteFormData>({
			resolver: zodResolver(noteSchema),
			defaultValues: { title: "", content: "" },
		});

	const watchedTitle = watch("title");
	const watchedContent = watch("content");

	function toggleChecklist() {
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

	useEffect(() => {
		if (expanded && titleRef.current) {
			titleRef.current.focus();
		}
	}, [expanded]);

	useEffect(() => {
		if (!expanded) return;
		function onDocMouseDown(e: MouseEvent) {
			mouseDownInsideRef.current =
				containerRef.current?.contains(e.target as Node) ?? false;
		}
		document.addEventListener("mousedown", onDocMouseDown);
		return () => document.removeEventListener("mousedown", onDocMouseDown);
	}, [expanded]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: save reads live form state via getValues
	useEffect(() => {
		if (!expanded) return;
		if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		saveTimerRef.current = setTimeout(() => {
			saveTimerRef.current = null;
			void flushSave();
		}, SAVE_DEBOUNCE_MS);
		return () => {
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		};
	}, [
		expanded,
		watchedTitle,
		watchedContent,
		selectedColor,
		isPinned,
		selectedLabelIds,
		checklist,
		isChecklist,
	]);

	async function flushSave() {
		if (closingRef.current) return;
		const { title, content } = getValues();
		const t = title?.trim() ?? "";
		const c = content?.trim() ?? "";
		const hasItemText = checklist.some((item) => item.text.trim().length > 0);
		if (!t && !c && !hasItemText) return;
		try {
			if (noteIdRef.current) {
				await onUpdate(noteIdRef.current, {
					title: t,
					content: c,
					labelIds: selectedLabelIds,
					color: selectedColor,
					isPinned,
					isChecklist,
					checklist,
				});
			} else {
				const created = await onSubmit({
					title: t,
					content: c,
					labelIds: selectedLabelIds,
					color: selectedColor,
					isPinned,
					isChecklist,
					checklist,
				});
				noteIdRef.current = created.id;
			}
		} catch {
			toast.error("Failed to save note");
		}
	}

	async function closeComposer() {
		if (closingRef.current) return;
		closingRef.current = true;
		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current);
			saveTimerRef.current = null;
		}
		const { title, content } = getValues();
		const t = title?.trim() ?? "";
		const c = content?.trim() ?? "";
		const hasItemText = checklist.some((item) => item.text.trim().length > 0);
		const hasData = Boolean(t || c || hasItemText || images.length > 0);
		try {
			if (noteIdRef.current) {
				if (!hasData) {
					await permanentDeleteNote(noteIdRef.current);
				} else {
					await onUpdate(noteIdRef.current, {
						title: t,
						content: c,
						labelIds: selectedLabelIds,
						color: selectedColor,
						isPinned,
						isChecklist,
						checklist,
					});
				}
			} else if (hasData) {
				await onSubmit({
					title: t,
					content: c,
					labelIds: selectedLabelIds,
					color: selectedColor,
					isPinned,
					isChecklist,
					checklist,
				});
			}
		} catch {
			toast.error("Failed to save note");
		} finally {
			closingRef.current = false;
			collapse();
		}
	}

	const handleFormSubmit = () => {
		void closeComposer();
	};

	async function handleFileSelect(files: FileList | null) {
		const file = files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			const nid = noteIdRef.current ?? (await submitAndGetNoteId());
			const uploaded = await uploadNoteImage(nid, file);
			setImages((prev) => [...prev, uploaded]);
		} catch {
			toast.error("Failed to upload image");
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}

	async function handleRemoveImage(imageId: number) {
		try {
			await deleteNoteImage(imageId);
			setImages((prev) => prev.filter((img) => img.id !== imageId));
		} catch {
			toast.error("Failed to delete image");
		}
	}

	async function submitAndGetNoteId(): Promise<number> {
		if (noteIdRef.current) return noteIdRef.current;
		const { title, content } = getValues();
		const created = await onSubmit({
			title: title?.trim() ?? "",
			content: content?.trim() ?? "",
			labelIds: selectedLabelIds,
			color: selectedColor,
			isPinned,
			isChecklist,
			checklist,
		});
		noteIdRef.current = created.id;
		return created.id;
	}

	function collapse() {
		setExpanded(false);
		setSelectedLabelIds([]);
		setSelectedColor(null);
		setIsPinned(false);
		setShowColorPicker(false);
		setShowLabelPicker(false);
		setImages([]);
		setIsChecklist(false);
		setChecklist([]);
		noteIdRef.current = null;
		reset({ title: "", content: "" });
	}

	// Close on blur if the focus leaves the composer
	function handleBlur(e: React.FocusEvent) {
		if (uploading || closingRef.current) return;
		// Clicks on non-focusable areas inside (e.g. padding) move focus to <body>,
		// so check whether the click that caused this blur originated inside.
		if (mouseDownInsideRef.current) {
			mouseDownInsideRef.current = false;
			return;
		}
		if (
			containerRef.current &&
			!containerRef.current.contains(e.relatedTarget as Node)
		) {
			void closeComposer();
		}
	}

	// Handle Escape key
	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Escape" && expanded) {
			e.preventDefault();
			if (!uploading) void closeComposer();
		}
	}

	if (!expanded) {
		return (
			<div className="mx-auto mb-6 w-full max-w-2xl">
				<button
					type="button"
					className="w-full cursor-text rounded-lg border bg-card px-4 py-3 text-start text-sm text-muted-foreground shadow-sm transition-shadow hover:shadow-md"
					onClick={() => setExpanded(true)}
				>
					Take a note...
				</button>
			</div>
		);
	}

	return (
		<div className="mx-auto mb-6 w-full max-w-2xl" ref={containerRef}>
			<section
				aria-label="New note composer"
				className="rounded-lg border bg-card shadow-md"
				onBlur={handleBlur}
				style={
					selectedColor
						? { backgroundColor: selectedColor, color: "#202124" }
						: undefined
				}
			>
				<form onSubmit={handleSubmit(handleFormSubmit)}>
					{images.length > 0 && (
						<div className="columns-2 gap-2 px-4 pb-2 pt-3">
							{images.map((image) => (
								<div
									key={image.id}
									className="group relative mb-2 break-inside-avoid"
								>
									<img
										src={image.presignedUrl}
										alt={image.filename}
										className="max-h-40 w-full rounded-md object-contain"
										loading="lazy"
										style={
											image.width && image.height
												? { aspectRatio: `${image.width} / ${image.height}` }
												: undefined
										}
									/>
									<button
										type="button"
										onClick={() => handleRemoveImage(image.id)}
										className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
										title="Remove image"
									>
										<Trash2Icon className="size-3" />
									</button>
								</div>
							))}
						</div>
					)}
					<div className="px-4 pb-2 pt-3">
						<input
							placeholder="Title"
							className={`w-full bg-transparent text-base font-medium outline-none ${
								selectedColor
									? "placeholder:text-[#5f6368]/50"
									: "placeholder:text-muted-foreground/60"
							}`}
							{...register("title")}
							ref={(e) => {
								register("title").ref(e);
								if (e)
									(
										titleRef as React.MutableRefObject<HTMLInputElement>
									).current = e;
							}}
						/>
					</div>
					<fieldset
						className="m-0 min-w-0 border-0 p-0 px-4 pb-3"
						onKeyDown={handleKeyDown}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp"
							className="hidden"
							onChange={(e) => handleFileSelect(e.target.files)}
						/>
						{isChecklist ? (
							<ChecklistEditor items={checklist} onChange={setChecklist} />
						) : (
							<textarea
								placeholder="Take a note..."
								className={`w-full resize-none bg-transparent text-sm outline-none ${
									selectedColor
										? "placeholder:text-[#5f6368]/50"
										: "placeholder:text-muted-foreground/60"
								}`}
								rows={2}
								{...register("content")}
								onKeyDown={handleKeyDown}
							/>
						)}
					</fieldset>

					{showLabelPicker && (
						<div className="border-t px-4 py-3">
							<LabelPicker
								selectedIds={selectedLabelIds}
								onChange={setSelectedLabelIds}
							/>
						</div>
					)}

					{uploading && (
						<div className="flex items-center gap-2 px-4 pb-2">
							<Loader2Icon className="size-4 animate-spin" />
							<span className="text-xs text-muted-foreground">
								Uploading...
							</span>
						</div>
					)}

					{showColorPicker && (
						<div className="border-t px-4 py-2">
							<div className="flex items-center gap-1.5">
								{NOTE_COLORS.map((c) => (
									<button
										key={c.name}
										type="button"
										title={c.name}
										className={`size-7 rounded-full border-2 transition-all ${
											selectedColor === c.value
												? "scale-110 border-foreground"
												: "border-transparent hover:scale-110"
										}`}
										style={c.value ? { backgroundColor: c.value } : undefined}
										onClick={() => {
											setSelectedColor(c.value);
											setShowColorPicker(false);
										}}
									>
										{!c.value && (
											<div className="flex h-full items-center justify-center">
												<div className="size-3 rounded-full border border-dashed border-muted-foreground" />
											</div>
										)}
									</button>
								))}
							</div>
						</div>
					)}

					<div className="flex items-center justify-between border-t px-2 py-1">
						<div className="flex items-center gap-0.5">
							<button
								type="button"
								onClick={() => setIsPinned(!isPinned)}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
									isPinned
										? selectedColor
											? "text-[#202124]"
											: "text-foreground"
										: selectedColor
											? "text-[#5f6368]"
											: "text-muted-foreground"
								}`}
								title="Pin note"
							>
								<PinIcon className={`size-4 ${isPinned ? "rotate-45" : ""}`} />
							</button>
							<button
								type="button"
								onClick={() => setShowColorPicker(!showColorPicker)}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
									selectedColor ? "text-[#5f6368]" : "text-muted-foreground"
								}`}
								title="Background color"
							>
								<PaletteIcon className="size-4" />
							</button>
							<button
								type="button"
								onClick={() => setShowLabelPicker(!showLabelPicker)}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
									selectedColor ? "text-[#5f6368]" : "text-muted-foreground"
								}`}
								title="Add label"
							>
								<TagIcon className="size-4" />
							</button>
							<button
								type="button"
								onClick={toggleChecklist}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
									isChecklist
										? selectedColor
											? "text-[#202124]"
											: "text-foreground"
										: selectedColor
											? "text-[#5f6368]"
											: "text-muted-foreground"
								}`}
								title="Show checkboxes"
							>
								<ListChecksIcon className="size-4" />
							</button>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 disabled:opacity-50 ${
									selectedColor ? "text-[#5f6368]" : "text-muted-foreground"
								}`}
								title="Add image"
							>
								<ImageIcon className="size-4" />
							</button>
						</div>
						<div className="flex items-center gap-1">
							<button
								type="submit"
								disabled={uploading || closingRef.current}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-current/10 disabled:opacity-50 ${
									selectedColor ? "text-[#202124]" : "text-foreground"
								}`}
							>
								Close
							</button>
						</div>
					</div>
				</form>
			</section>
		</div>
	);
}
