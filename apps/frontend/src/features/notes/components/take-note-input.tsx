import { zodResolver } from "@hookform/resolvers/zod";
import { PinIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
	}) => Promise<void>;
}

export function TakeNoteInput({ onSubmit }: TakeNoteInputProps) {
	const [expanded, setExpanded] = useState(false);
	const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const [isPinned, setIsPinned] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);

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
		await onSubmit({
			title,
			content,
			labelIds: selectedLabelIds,
			color: selectedColor,
			isPinned,
		});
		setSubmitting(false);
		collapse();
	};

	function collapse() {
		setExpanded(false);
		setSelectedLabelIds([]);
		setSelectedColor(null);
		setIsPinned(false);
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
				style={selectedColor ? { backgroundColor: selectedColor } : undefined}
			>
				<form onSubmit={handleSubmit(handleFormSubmit)}>
					<div className="px-4 pb-2 pt-3">
						<input
							placeholder="Title"
							className="w-full bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground/60"
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
						<textarea
							placeholder="Take a note..."
							className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
							rows={2}
							{...register("content")}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
						/>
					</div>
					<div className="flex items-center justify-between border-t px-2 py-1">
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => setIsPinned(!isPinned)}
								className={`flex size-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 ${
									isPinned ? "text-foreground" : "text-muted-foreground"
								}`}
								title="Pin note"
							>
								<PinIcon className={`size-4 ${isPinned ? "rotate-45" : ""}`} />
							</button>
							<ColorButton
								colors={NOTE_COLORS}
								selected={selectedColor}
								onChange={setSelectedColor}
							/>
						</div>
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={collapse}
								className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10"
								title="Close"
							>
								<XIcon className="size-4" />
							</button>
							<button
								type="submit"
								disabled={submitting}
								className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-50"
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

function ColorButton({
	colors,
	selected,
	onChange,
}: {
	colors: { name: string; value: string | null }[];
	selected: string | null;
	onChange: (color: string | null) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10"
				title="Background color"
			>
				<div className="size-4 rounded-sm border border-current" />
			</button>
			{open && (
				<>
					<button
						type="button"
						className="fixed inset-0 z-10"
						tabIndex={-1}
						aria-hidden="true"
						onClick={() => setOpen(false)}
					/>
					<div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border bg-popover p-2 shadow-lg">
						{colors.map((c) => (
							<button
								key={c.name}
								type="button"
								title={c.name}
								className={`size-6 rounded-full border-2 transition-all ${
									selected === c.value
										? "scale-110 border-foreground"
										: "border-transparent hover:scale-110"
								}`}
								style={c.value ? { backgroundColor: c.value } : undefined}
								onClick={() => {
									onChange(c.value);
									setOpen(false);
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
				</>
			)}
		</div>
	);
}
