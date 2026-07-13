import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import {
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldContent, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { LabelPicker } from "./label-picker";

const noteSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
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
	onSubmit: (
		data: NoteFormData & { labelIds: number[]; color: string | null },
	) => Promise<void>;
	onDelete?: () => Promise<void>;
	submitLabel?: string;
}

export function NoteForm({
	initialTitle = "",
	initialContent = "",
	initialLabelIds = [],
	initialColor = null,
	onSubmit,
	onDelete,
	submitLabel = "Save",
}: NoteFormProps) {
	const [selectedLabelIds, setSelectedLabelIds] =
		useState<number[]>(initialLabelIds);
	const [selectedColor, setSelectedColor] = useState<string | null>(
		initialColor,
	);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<NoteFormData>({
		resolver: zodResolver(noteSchema),
		defaultValues: { title: initialTitle, content: initialContent },
	});

	return (
		<form
			onSubmit={handleSubmit((data) =>
				onSubmit({ ...data, labelIds: selectedLabelIds, color: selectedColor }),
			)}
		>
			<DialogHeader>
				<DialogTitle>{onDelete ? "Edit Note" : "New Note"}</DialogTitle>
			</DialogHeader>
			<div className="space-y-3 py-4">
				<Field>
					<FieldContent>
						<Input placeholder="Title" {...register("title")} required />
						{errors.title && <FieldError errors={[errors.title]} />}
					</FieldContent>
				</Field>
				<Field>
					<FieldContent>
						<Textarea
							placeholder="Take a note..."
							{...register("content")}
							rows={5}
							required
						/>
						{errors.content && <FieldError errors={[errors.content]} />}
					</FieldContent>
				</Field>
				<Field>
					<FieldContent>
						<LabelPicker
							selectedIds={selectedLabelIds}
							onChange={setSelectedLabelIds}
						/>
					</FieldContent>
				</Field>
				<div>
					<p className="mb-1.5 text-xs text-muted-foreground">Color</p>
					<div className="flex items-center gap-1.5">
						{NOTE_COLORS.map((c) => (
							<button
								key={c.name}
								type="button"
								title={c.name}
								className={`size-6 rounded-full border-2 transition-all ${
									selectedColor === c.value
										? "border-foreground scale-110"
										: "border-transparent hover:scale-110"
								}`}
								style={c.value ? { backgroundColor: c.value } : undefined}
								onClick={() => setSelectedColor(c.value)}
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
			</div>
			<DialogFooter showCloseButton={!!onDelete}>
				{onDelete && (
					<Button
						type="button"
						variant="destructive"
						disabled={isSubmitting}
						onClick={onDelete}
					>
						Delete
					</Button>
				)}
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : submitLabel}
				</Button>
			</DialogFooter>
		</form>
	);
}
