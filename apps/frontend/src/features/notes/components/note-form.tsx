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

interface NoteFormProps {
	initialTitle?: string;
	initialContent?: string;
	initialLabelIds?: number[];
	onSubmit: (data: NoteFormData & { labelIds: number[] }) => Promise<void>;
	onDelete?: () => Promise<void>;
	submitLabel?: string;
}

export function NoteForm({
	initialTitle = "",
	initialContent = "",
	initialLabelIds = [],
	onSubmit,
	onDelete,
	submitLabel = "Save",
}: NoteFormProps) {
	const [selectedLabelIds, setSelectedLabelIds] =
		useState<number[]>(initialLabelIds);
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
				onSubmit({ ...data, labelIds: selectedLabelIds }),
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
