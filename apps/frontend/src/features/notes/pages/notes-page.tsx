import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { useLabels } from "#/features/labels/hooks";
import type { Label } from "#/features/labels/types";
import {
	notesQueryKey,
	useCreateNote,
	useNotes,
	usePermanentDeleteNote,
	useReorderNotes,
	useRestoreNote,
	useTrashNote,
	useUpdateNote,
} from "#/features/notes/hooks";
import type { Note, NoteChecklistItem } from "#/features/notes/types";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { getErrorMessage } from "#/lib/api";
import { authClient } from "#/lib/auth-client";
import { AppSidebar } from "../components/app-sidebar";
import { EditNoteDialog } from "../components/edit-note-dialog";
import { NotesGrid } from "../components/notes-grid";
import { NotesGridSkeleton } from "../components/notes-grid-skeleton";
import { NotesHeader } from "../components/notes-header";
import { TakeNoteInput } from "../components/take-note-input";

export function NotesPage() {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [filterLabelId, setFilterLabelId] = useState<number | undefined>();
	const [search, setSearch] = useState("");
	const [view, setView] = useState<"notes" | "archived" | "trash">("notes");
	const [layout, setLayout] = useState<"grid" | "list">("grid");

	const debouncedSearch = useDebouncedValue(search, search ? 250 : 0);

	const notesParams = {
		labelId: view === "notes" ? filterLabelId : undefined,
		search: debouncedSearch || undefined,
		archived: view === "archived",
		trash: view === "trash",
	};

	const notesQuery = useNotes(notesParams);

	const labelsQuery = useLabels();
	const labels: Label[] = labelsQuery.data ?? [];
	const notes: Note[] = notesQuery.data ?? [];

	const createNoteMutation = useCreateNote();
	const updateNoteMutation = useUpdateNote();
	const trashNoteMutation = useTrashNote();
	const restoreNoteMutation = useRestoreNote();
	const permanentDeleteMutation = usePermanentDeleteNote();
	const reorderMutation = useReorderNotes();

	async function handleCreate(note: {
		title: string;
		content: string;
		labelIds: number[];
		color: string | null;
		isPinned?: boolean;
		isChecklist?: boolean;
		checklist?: NoteChecklistItem[];
	}): Promise<Note> {
		return createNoteMutation.mutateAsync(note);
	}

	async function handleUpdate(
		id: number,
		note: {
			title: string;
			content: string;
			labelIds: number[];
			color: string | null;
			isPinned?: boolean;
			isChecklist?: boolean;
			checklist?: NoteChecklistItem[];
		},
	) {
		await updateNoteMutation.mutateAsync({ id, note });
		setEditingNote(null);
	}

	async function handleDelete(id: number) {
		await trashNoteMutation.mutateAsync(id);
		setEditingNote(null);
	}

	async function handleTogglePin(note: Note) {
		await updateNoteMutation.mutateAsync({
			id: note.id,
			note: { isPinned: !note.isPinned },
		});
	}

	async function handleArchive(note: Note) {
		await updateNoteMutation.mutateAsync({
			id: note.id,
			note: { isArchived: true },
		});
	}

	async function handleTrash(note: Note) {
		await trashNoteMutation.mutateAsync(note.id);
	}

	async function handleRestore(note: Note) {
		await restoreNoteMutation.mutateAsync(note.id);
	}

	async function handlePermanentDelete(note: Note) {
		await permanentDeleteMutation.mutateAsync(note.id);
	}

	function handleReorderLive(activeId: number, overId: number) {
		queryClient.setQueryData(
			notesQueryKey(notesParams),
			(current: Note[] | undefined) => {
				if (!current) return current;
				const idx = current.findIndex((n) => n.id === activeId);
				const overIdx = current.findIndex((n) => n.id === overId);
				if (idx === -1 || overIdx === -1 || idx === overIdx) return current;
				const next = [...current];
				const [moved] = next.splice(idx, 1);
				next.splice(overIdx, 0, moved);
				return next;
			},
		);
	}

	function handleReorder() {
		// The order was already applied live during the drag; persist the result.
		const current =
			queryClient.getQueryData<Note[]>(notesQueryKey(notesParams)) ?? [];
		reorderMutation.mutate(current.map((n) => n.id));
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
							{notesQuery.isPending ? (
								<NotesGridSkeleton />
							) : notesQuery.isError ? (
								<div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
									<p>{getErrorMessage(notesQuery.error)}</p>
									<button
										type="button"
										onClick={() => notesQuery.refetch()}
										className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-foreground/10"
									>
										Retry
									</button>
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
									onReorderLive={handleReorderLive}
									view={view}
									layout={layout}
									search={debouncedSearch}
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
