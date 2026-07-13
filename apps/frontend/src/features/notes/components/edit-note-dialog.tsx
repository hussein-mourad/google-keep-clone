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
import type { Note } from "../types";

interface EditNoteDialogProps {
	note: Note | null;
	onOpenChange: (open: boolean) => void;
	onUpdate: (
		id: number,
		note: { title: string; content: string },
	) => Promise<void>;
	onDelete: (id: number) => Promise<void>;
}

export function EditNoteDialog({
	note,
	onOpenChange,
	onUpdate,
	onDelete,
}: EditNoteDialogProps) {
	const [title, setTitle] = useState(note?.title ?? "");
	const [content, setContent] = useState(note?.content ?? "");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!note || !title.trim() || !content.trim()) return;
		setSubmitting(true);
		try {
			await onUpdate(note.id, { title: title.trim(), content: content.trim() });
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!note) return;
		setSubmitting(true);
		try {
			await onDelete(note.id);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={!!note} onOpenChange={(open) => !open && onOpenChange(false)}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Note</DialogTitle>
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
					<DialogFooter showCloseButton>
						<Button
							type="button"
							variant="destructive"
							disabled={submitting}
							onClick={handleDelete}
						>
							Delete
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
