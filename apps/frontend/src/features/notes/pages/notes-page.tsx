import { useEffect, useState } from "react";
import { getLabels } from "#/features/labels/api";
import type { Label } from "#/features/labels/types";
import {
	createNote,
	deleteNote,
	getNotes,
	updateNote,
} from "#/features/notes/api";
import type { Note } from "#/features/notes/types";
import { authClient } from "#/lib/auth-client";
import { CreateNoteDialog } from "../components/create-note-dialog";
import { EditNoteDialog } from "../components/edit-note-dialog";
import { NotesGrid } from "../components/notes-grid";
import { NotesHeader } from "../components/notes-header";

export function NotesPage() {
	const { data: session } = authClient.useSession();
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [labels, setLabels] = useState<Label[]>([]);
	const [filterLabelId, setFilterLabelId] = useState<number | undefined>();

	async function loadNotes() {
		try {
			const data = await getNotes(filterLabelId);
			setNotes(data);
		} catch {
			setNotes([]);
		} finally {
			setLoading(false);
		}
	}

	async function loadLabels() {
		try {
			const data = await getLabels();
			setLabels(data);
		} catch {
			setLabels([]);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only fetch
	useEffect(() => {
		loadLabels();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reload when filter changes
	useEffect(() => {
		loadNotes();
	}, [filterLabelId]);

	async function handleCreate(note: {
		title: string;
		content: string;
		labelIds: number[];
	}) {
		await createNote(note);
		setCreateOpen(false);
		await loadNotes();
	}

	async function handleUpdate(
		id: number,
		note: { title: string; content: string; labelIds: number[] },
	) {
		await updateNote(id, note);
		setEditingNote(null);
		await loadNotes();
	}

	async function handleDelete(id: number) {
		await deleteNote(id);
		setEditingNote(null);
		await loadNotes();
	}

	return (
		<div className="min-h-screen">
			<NotesHeader
				labels={labels}
				filterLabelId={filterLabelId}
				onFilterChange={setFilterLabelId}
				onNewNote={() => setCreateOpen(true)}
				user={session?.user ?? null}
			/>
			<main className="mx-auto max-w-7xl p-4">
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					</div>
				) : (
					<NotesGrid notes={notes} onNoteClick={setEditingNote} />
				)}
			</main>
			<CreateNoteDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				onSubmit={handleCreate}
			/>
			<EditNoteDialog
				note={editingNote}
				onOpenChange={() => setEditingNote(null)}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
			/>
		</div>
	);
}
