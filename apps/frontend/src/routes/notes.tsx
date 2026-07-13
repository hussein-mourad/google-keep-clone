import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";
import { ProtectedRoute } from "#/components/protected-route";
import { ModeToggle } from "#/components/theme/toggle";
import { Button } from "#/components/ui/button";
import {
	createNote,
	deleteNote,
	getNotes,
	updateNote,
} from "#/features/notes/api";
import { CreateNoteDialog } from "#/features/notes/components/create-note-dialog";
import { EditNoteDialog } from "#/features/notes/components/edit-note-dialog";
import { NotesGrid } from "#/features/notes/components/notes-grid";
import type { Note } from "#/features/notes/types";

export const Route = createFileRoute("/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/" });
	};

	async function loadNotes() {
		try {
			const data = await getNotes();
			setNotes(data);
		} catch {
			setNotes([]);
		} finally {
			setLoading(false);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only fetch
	useEffect(() => {
		loadNotes();
	}, []);

	async function handleCreate(note: { title: string; content: string }) {
		await createNote(note);
		setCreateOpen(false);
		await loadNotes();
	}

	async function handleUpdate(
		id: number,
		note: { title: string; content: string },
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
		<ProtectedRoute>
			<div className="min-h-screen">
				<header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
					<h1 className="text-lg font-medium">Notes</h1>
					<div className="flex items-center gap-2">
						<Button onClick={() => setCreateOpen(true)}>
							<PlusIcon className="size-4" />
							New Note
						</Button>
						<Button variant="outline" size="icon" onClick={handleSignOut}>
							<LogOutIcon className="size-4" />
						</Button>
						<ModeToggle />
					</div>
				</header>
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
		</ProtectedRoute>
	);
}
