import { zodResolver } from "@hookform/resolvers/zod";
import {
	ImageIcon,
	Loader2Icon,
	PaletteIcon,
	PinIcon,
	TagIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { uploadNoteImage } from "../api";
import type { Note } from "../types";
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

interface TakeNoteInputProps {
	onSubmit: (note: {
		title: string;
		content: string;
		labelIds: number[];
		color: string | null;
		isPinned?: boolean;
	}) => Promise<Note>;
}

export function TakeNoteInput({ onSubmit }: TakeNoteInputProps) {
	const [expanded, setExpanded] = useState(false);
	const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [isPinned, setIsPinned] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showLabelPicker, setShowLabelPicker] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [noteId, setNoteId] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { register, handleSubmit, reset } = useForm<NoteFormData>({
		resolver: zodResolver(noteSchema),
		defaultValues: { title: "", content: "" },
	});

	useEffect(() => {
		if (expanded && titleRef.current) {
			titleRef.current.focus();
		}
	}, [expanded]);

	const handleFormSubmit = async (data: NoteFormData) => {
		const title = data.title?.trim() ?? "";
		const content = data.content?.trim() ?? "";
		if (!title && !content) {
			collapse();
			return;
		}
		setSubmitting(true);
		const created = await onSubmit({
			title,
			content,
			labelIds: selectedLabelIds,
			color: selectedColor,
			isPinned,
		});
		setNoteId(created.id);
		setSubmitting(false);
		collapse();
	};

	async function handleFileSelect(files: FileList | null) {
		const file = files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			const nid = noteId ?? (await submitAndGetNoteId());
			await uploadNoteImage(nid, file);
		} catch {
			toast.error("Failed to upload image");
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}

	async function submitAndGetNoteId(): Promise<number> {
		const { title, content } = getValues();
		if (!title?.trim() && !content?.trim()) throw new Error("No content");
		const created = await onSubmit({
			title: title?.trim() || "Untitled",
			content: content?.trim() || "",
			labelIds: selectedLabelIds,
			color: selectedColor,
			isPinned,
		});
		setNoteId(created.id);
		return created.id;
	}

	function collapse() {
		setExpanded(false);
		setSelectedLabelIds([]);
		setSelectedColor(null);
		setIsPinned(false);
		setShowColorPicker(false);
		setShowLabelPicker(false);
		setNoteId(null);
		reset({ title: "", content: "" });
	}

	// Close on blur if both fields are empty
	function handleBlur(e: React.FocusEvent) {
		if (
			containerRef.current &&
			!containerRef.current.contains(e.relatedTarget)
		) {
			const form = containerRef.current.querySelector("form");
			if (form) {
				const title = (form.elements.namedItem("title") as HTMLInputElement)
					?.value;
				const content = (
					form.elements.namedItem("content") as HTMLTextAreaElement
				)?.value;
				if (!title?.trim() && !content?.trim()) {
					collapse();
				}
			}
		}
	}

	// Handle Escape key
	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Escape" && expanded) {
			e.preventDefault();
			const form = containerRef.current?.querySelector("form");
			if (form) {
				const title = (form.elements.namedItem("title") as HTMLInputElement)
					?.value;
				const content = (
					form.elements.namedItem("content") as HTMLTextAreaElement
				)?.value;
				if (!title?.trim() && !content?.trim()) {
					collapse();
				}
			}
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
			<div
				className="rounded-lg border bg-card shadow-md"
				style={
					selectedColor
						? { backgroundColor: selectedColor, color: "#202124" }
						: undefined
				}
			>
				<form onSubmit={handleSubmit(handleFormSubmit)}>
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
					<div className="px-4 pb-3">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp"
							className="hidden"
							onChange={(e) => handleFileSelect(e.target.files)}
						/>
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
							onBlur={handleBlur}
						/>
					</div>

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
								disabled={submitting}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-current/10 disabled:opacity-50 ${
									selectedColor ? "text-[#202124]" : "text-foreground"
								}`}
							>
								{submitting ? "Saving..." : "Close"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
