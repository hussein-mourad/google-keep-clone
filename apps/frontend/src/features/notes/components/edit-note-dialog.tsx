import { useState } from "react";
import { Dialog, DialogContent } from "#/components/ui/dialog";
import type { Note } from "../types";
import { NoteForm } from "./note-form";

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
	const [version, setVersion] = useState(0);

	const open = !!note;
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onOpenChange(false);
			setVersion((v) => v + 1);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<NoteForm
					key={version}
					initialTitle={note?.title ?? ""}
					initialContent={note?.content ?? ""}
					onSubmit={async (data) => {
						if (!note) return;
						await onUpdate(note.id, data);
					}}
					onDelete={async () => {
						if (!note) return;
						await onDelete(note.id);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
