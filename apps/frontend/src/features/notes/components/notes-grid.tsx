import type { Note } from "../types";
import { NoteCard } from "./note-card";

interface NotesGridProps {
	notes: Note[];
	onNoteClick: (note: Note) => void;
	onTogglePin?: (note: Note) => void;
	onArchive?: (note: Note) => void;
	onTrash?: (note: Note) => void;
	onRestore?: (note: Note) => void;
	onPermanentDelete?: (note: Note) => void;
	view?: "notes" | "archived" | "trash";
	layout?: "grid" | "list";
}

function EmptyState({ view }: { view: string }) {
	const messages: Record<string, { title: string; subtitle: string }> = {
		notes: {
			title: "No notes yet",
			subtitle: "Create your first note to get started",
		},
		archived: {
			title: "No archived notes",
			subtitle: "Archive notes to keep them organized",
		},
		trash: {
			title: "Trash is empty",
			subtitle: "Deleted notes will appear here",
		},
	};
	const msg = messages[view] ?? messages.notes;
	return (
		<div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
			<p className="text-lg">{msg.title}</p>
			<p className="text-sm">{msg.subtitle}</p>
		</div>
	);
}

function NoteList({
	notes,
	onNoteClick,
	onTogglePin,
	onArchive,
	onTrash,
	onRestore,
	onPermanentDelete,
	view,
	layout,
}: NotesGridProps) {
	if (layout === "list") {
		return (
			<div className="mx-auto flex max-w-2xl flex-col gap-3">
				{notes.map((note) => (
					<NoteCard
						key={note.id}
						note={note}
						onClick={onNoteClick}
						onTogglePin={onTogglePin}
						onArchive={onArchive}
						onTrash={onTrash}
						onRestore={onRestore}
						onPermanentDelete={onPermanentDelete}
						view={view}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
			{notes.map((note) => (
				<NoteCard
					key={note.id}
					note={note}
					onClick={onNoteClick}
					onTogglePin={onTogglePin}
					onArchive={onArchive}
					onTrash={onTrash}
					onRestore={onRestore}
					onPermanentDelete={onPermanentDelete}
					view={view}
				/>
			))}
		</div>
	);
}

export function NotesGrid(props: NotesGridProps) {
	const { notes, view = "notes" } = props;

	if (notes.length === 0) {
		return <EmptyState view={view} />;
	}

	if (view !== "notes") {
		return <NoteList {...props} />;
	}

	const pinned = notes.filter((n) => n.isPinned);
	const unpinned = notes.filter((n) => !n.isPinned);

	return (
		<div className="space-y-8">
			{pinned.length > 0 && (
				<section>
					<h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
						Pinned
					</h2>
					<NoteList {...props} notes={pinned} />
				</section>
			)}
			{unpinned.length > 0 && (
				<section>
					{pinned.length > 0 && (
						<h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
							Others
						</h2>
					)}
					<NoteList {...props} notes={unpinned} />
				</section>
			)}
		</div>
	);
}
