import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArchiveIcon,
	PaletteIcon,
	TagIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

interface NoteFormProps {
	initialTitle?: string;
	initialContent?: string;
	initialLabelIds?: number[];
	initialColor?: string | null;
	onSubmit: (data: {
		title: string;
		content: string;
		labelIds: number[];
		color: string | null;
	}) => Promise<void>;
	onDelete?: () => Promise<void>;
	onArchive?: () => Promise<void>;
	onClose: () => void;
	closeRef?: React.MutableRefObject<(() => void) | undefined>;
}

export function NoteForm({
	initialTitle = "",
	initialContent = "",
	initialLabelIds = [],
	initialColor = null,
	onSubmit,
	onDelete,
	onArchive,
	onClose,
	closeRef,
}: NoteFormProps) {
	const [selectedLabelIds, setSelectedLabelIds] =
		useState<number[]>(initialLabelIds);
	const [selectedColor, setSelectedColor] = useState<string | null>(
		initialColor,
	);
	const [saving, setSaving] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showLabelPicker, setShowLabelPicker] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		getValues,
		formState: { isSubmitting },
	} = useForm<NoteFormData>({
		resolver: zodResolver(noteSchema),
		defaultValues: { title: initialTitle, content: initialContent },
	});

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	async function handleClose() {
		const { title = "", content = "" } = getValues();
		const trimmedTitle = title.trim();
		const trimmedContent = content.trim();
		if (!trimmedTitle && !trimmedContent) {
			onClose();
			return;
		}
		if (
			trimmedTitle === initialTitle &&
			trimmedContent === initialContent &&
			selectedColor === initialColor &&
			JSON.stringify([...selectedLabelIds].sort()) ===
				JSON.stringify([...initialLabelIds].sort())
		) {
			onClose();
			return;
		}
		setSaving(true);
		await onSubmit({
			title: trimmedTitle || initialTitle || "Untitled",
			content: trimmedContent || initialContent || "",
			labelIds: selectedLabelIds,
			color: selectedColor,
		});
		setSaving(false);
		onClose();
	}

	if (closeRef) {
		closeRef.current = handleClose;
	}

	return (
		<div
			className="flex flex-col"
			style={
				selectedColor
					? { backgroundColor: selectedColor, color: "#202124" }
					: undefined
			}
		>
			<form onSubmit={handleSubmit(handleClose)}>
				<div className="flex items-center justify-between px-4 pt-3 pb-1">
					<button
						type="button"
						onClick={handleClose}
						disabled={saving || isSubmitting}
						className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
							selectedColor ? "text-[#5f6368]" : "text-muted-foreground"
						}`}
						title="Back"
					>
						<XIcon className="size-5" />
					</button>
					{(saving || isSubmitting) && (
						<span
							className={`text-xs ${selectedColor ? "text-[#5f6368]" : "text-muted-foreground"}`}
						>
							Saving...
						</span>
					)}
				</div>
				<div className="space-y-1 px-4 pb-2 pt-1">
					<input
						placeholder="Title"
						className={`w-full bg-transparent text-xl font-medium outline-none ${
							selectedColor
								? "placeholder:text-[#5f6368]/50"
								: "placeholder:text-muted-foreground/60"
						}`}
						{...register("title")}
						ref={(e) => {
							register("title").ref(e);
							if (e)
								(titleRef as React.MutableRefObject<HTMLInputElement>).current =
									e;
						}}
					/>
					<textarea
						placeholder="Take a note..."
						className={`w-full resize-none bg-transparent text-sm leading-relaxed outline-none ${
							selectedColor
								? "placeholder:text-[#5f6368]/50"
								: "placeholder:text-muted-foreground/60"
						}`}
						style={{ minHeight: "160px" }}
						{...register("content")}
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
					</div>
					<div className="flex items-center gap-0.5">
						{onArchive && (
							<button
								type="button"
								onClick={onArchive}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
									selectedColor ? "text-[#5f6368]" : "text-muted-foreground"
								}`}
								title="Archive"
							>
								<ArchiveIcon className="size-4" />
							</button>
						)}
						{onDelete && (
							<button
								type="button"
								onClick={onDelete}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/10 ${
									selectedColor ? "text-[#5f6368]" : "text-muted-foreground"
								}`}
								title="Delete"
							>
								<Trash2Icon className="size-4" />
							</button>
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
