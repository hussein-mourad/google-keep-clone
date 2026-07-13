import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";

interface CreateNoteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (note: { title: string; content: string }) => Promise<void>;
}

export function CreateNoteDialog({
	open,
	onOpenChange,
	onSubmit,
}: CreateNoteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<NoteForm onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}

interface NoteFormProps {
	initialTitle?: string;
	initialContent?: string;
	onSubmit: (note: { title: string; content: string }) => Promise<void>;
}

function NoteForm({
	initialTitle = "",
	initialContent = "",
	onSubmit,
}: NoteFormProps) {
	const [title, setTitle] = useState(initialTitle);
	const [content, setContent] = useState(initialContent);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) return;
		setSubmitting(true);
		try {
			await onSubmit({ title: title.trim(), content: content.trim() });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<DialogHeader>
				<DialogTitle>New Note</DialogTitle>
			</DialogHeader>
			<div className="space-y-3 py-4">
				<Input
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<Textarea
					placeholder="Take a note..."
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={5}
					required
				/>
			</div>
			<DialogFooter>
				<Button type="submit" disabled={submitting}>
					{submitting ? "Saving..." : "Create"}
				</Button>
			</DialogFooter>
		</form>
	);
}
