import { useEffect, useRef, useState } from "react";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { getLabels } from "#/features/labels/api";
import type { Label } from "#/features/labels/types";
import {
	createNote,
	getNotes,
	permanentDeleteNote,
	reorderNotes,
	restoreNote,
	trashNote,
	updateNote,
} from "#/features/notes/api";
import type { Note } from "#/features/notes/types";
import { authClient } from "#/lib/auth-client";
import { AppSidebar } from "../components/app-sidebar";
import { EditNoteDialog } from "../components/edit-note-dialog";
import { NotesGrid } from "../components/notes-grid";
import { NotesHeader } from "../components/notes-header";
import { TakeNoteInput } from "../components/take-note-input";

export function NotesPage() {
	const { data: session } = authClient.useSession();
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [labels, setLabels] = useState<Label[]>([]);
	const [filterLabelId, setFilterLabelId] = useState<number | undefined>();
	const [search, setSearch] = useState("");
	const [view, setView] = useState<"notes" | "archived" | "trash">("notes");
	const [layout, setLayout] = useState<"grid" | "list">("grid");
	const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	async function loadNotes() {
		try {
			const data = await getNotes({
				labelId: view === "notes" ? filterLabelId : undefined,
				search: search || undefined,
				archived: view === "archived",
				trash: view === "trash",
			});
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only
	useEffect(() => {
		loadLabels();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reload when filter/search/view changes
	useEffect(() => {
		setLoading(true);
		if (searchTimeout.current) clearTimeout(searchTimeout.current);
		searchTimeout.current = setTimeout(
			() => {
				loadNotes();
			},
			search ? 250 : 0,
		);
		return () => {
			if (searchTimeout.current) clearTimeout(searchTimeout.current);
		};
	}, [filterLabelId, search, view]);

	async function handleCreate(note: {
		title: string;
		content: string;
		labelIds: number[];
		color: string | null;
		isPinned?: boolean;
	}): Promise<Note> {
		const created = await createNote(note);
		await loadNotes();
		return created;
	}

	async function handleUpdate(
		id: number,
		note: {
			title: string;
			content: string;
			labelIds: number[];
			color: string | null;
			isPinned?: boolean;
		},
	) {
		await updateNote(id, note);
		setEditingNote(null);
		await loadNotes();
	}

	async function handleDelete(id: number) {
		await trashNote(id);
		setEditingNote(null);
		await loadNotes();
	}

	async function handleTogglePin(note: Note) {
		await updateNote(note.id, { isPinned: !note.isPinned });
		await loadNotes();
	}

	async function handleArchive(note: Note) {
		await updateNote(note.id, { isArchived: true });
		await loadNotes();
	}

	async function handleTrash(note: Note) {
		await trashNote(note.id);
		await loadNotes();
	}

	async function handleRestore(note: Note) {
		await restoreNote(note.id);
		await loadNotes();
	}

	async function handlePermanentDelete(note: Note) {
		await permanentDeleteNote(note.id);
		await loadNotes();
	}

	function handleReorder(activeId: number, overId: number) {
		const idx = notes.findIndex((n) => n.id === activeId);
		const overIdx = notes.findIndex((n) => n.id === overId);
		if (idx === -1 || overIdx === -1) return;
		const next = [...notes];
		const [moved] = next.splice(idx, 1);
		next.splice(overIdx, 0, moved);
		setNotes(next);
		reorderNotes(next.map((n) => n.id)).catch(() => loadNotes());
	}

	return (
		<div className="[--header-height:calc(--spacing(14))]">
			<SidebarProvider className="flex flex-col">
				<NotesHeader
					search={search}
					onSearchChange={setSearch}
					layout={layout}
					onLayoutChange={setLayout}
					user={session?.user ?? null}
				/>
				<div className="flex flex-1">
					<AppSidebar
						view={view}
						onViewChange={(v) => {
							setView(v);
							if (v !== "notes") setFilterLabelId(undefined);
						}}
						labels={labels}
						filterLabelId={filterLabelId}
						onFilterChange={(id) => {
							setFilterLabelId(id);
							if (id) setView("notes");
						}}
					/>
					<SidebarInset>
						<main className="flex-1 p-6">
							{view === "notes" && (
								<TakeNoteInput
									onSubmit={handleCreate}
									onUpdate={handleUpdate}
								/>
							)}
							{loading ? (
								<div className="flex items-center justify-center py-20">
									<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
								</div>
							) : (
								<NotesGrid
									notes={notes}
									onNoteClick={setEditingNote}
									onTogglePin={handleTogglePin}
									onArchive={handleArchive}
									onTrash={handleTrash}
									onRestore={handleRestore}
									onPermanentDelete={handlePermanentDelete}
									onReorder={handleReorder}
									view={view}
									layout={layout}
								/>
							)}
						</main>
					</SidebarInset>
				</div>
				<EditNoteDialog
					note={editingNote}
					onOpenChange={() => setEditingNote(null)}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
					onArchive={handleArchive}
				/>
			</SidebarProvider>
		</div>
	);
}
