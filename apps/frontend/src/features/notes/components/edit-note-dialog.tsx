import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Dialog, DialogContent } from "#/components/ui/dialog";
import type { Note } from "../types";
import { NoteForm } from "./note-form";

interface EditNoteDialogProps {
	note: Note | null;
	onOpenChange: (open: boolean) => void;
	onUpdate: (
		id: number,
		note: {
			title: string;
			content: string;
			labelIds: number[];
			color: string | null;
		},
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
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const open = !!note;
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onOpenChange(false);
			setVersion((v) => v + 1);
		}
	};

	const handleDelete = async () => {
		if (!note) return;
		setDeleting(true);
		await onDelete(note.id);
		setDeleting(false);
		setConfirmDelete(false);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent>
					<NoteForm
						key={version}
						initialTitle={note?.title ?? ""}
						initialContent={note?.content ?? ""}
						initialLabelIds={note?.labels?.map((l) => l.id) ?? []}
						initialColor={note?.color ?? null}
						onSubmit={async (data) => {
							if (!note) return;
							await onUpdate(note.id, data);
						}}
						onDelete={async () => {
							setConfirmDelete(true);
						}}
					/>
				</DialogContent>
			</Dialog>
			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete note?</AlertDialogTitle>
						<AlertDialogDescription>
							This will move the note to the trash. You can restore it later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button
							variant="destructive"
							disabled={deleting}
							onClick={handleDelete}
						>
							{deleting ? "Deleting..." : "Delete"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
