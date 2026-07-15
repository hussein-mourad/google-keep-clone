import { useRef, useState } from "react";
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
	onArchive: (note: Note) => Promise<void>;
}

export function EditNoteDialog({
	note,
	onOpenChange,
	onUpdate,
	onDelete,
	onArchive,
}: EditNoteDialogProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const formCloseRef = useRef<() => void>();

	const open = !!note;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onOpenChange(false);
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
				<DialogContent
					className="gap-0 overflow-hidden p-0 sm:max-w-xl"
					showCloseButton={false}
					onInteractOutside={(e) => {
						e.preventDefault();
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							e.preventDefault();
							formCloseRef.current?.();
						}
					}}
				>
					{note && (
						<NoteForm
							key={note.id + (note.updatedAt ?? "")}
							initialTitle={note.title}
							initialContent={note.content}
							initialLabelIds={note.labels?.map((l) => l.id) ?? []}
							initialColor={note.color}
							onSubmit={async (data) => {
								await onUpdate(note.id, data);
							}}
							onDelete={async () => {
								setConfirmDelete(true);
							}}
							onArchive={async () => {
								await onArchive(note);
								onOpenChange(false);
							}}
							onClose={() => onOpenChange(false)}
							closeRef={formCloseRef}
						/>
					)}
				</DialogContent>
			</Dialog>
			{confirmDelete && (
				<div
					className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
					role="dialog"
					aria-modal="true"
					onClick={(e) => {
						if (e.target === e.currentTarget) setConfirmDelete(false);
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") setConfirmDelete(false);
					}}
				>
					<div className="rounded-lg border bg-card p-6 shadow-lg">
						<p className="mb-4 text-sm">
							Delete note? It will be moved to the trash.
						</p>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setConfirmDelete(false)}
								className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-foreground/10"
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={deleting}
								onClick={handleDelete}
								className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground transition-colors hover:bg-destructive/90"
							>
								{deleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
