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
}

export function NotesGrid({
	notes,
	onNoteClick,
	onTogglePin,
	onArchive,
	onTrash,
	onRestore,
	onPermanentDelete,
	view = "notes",
}: NotesGridProps) {
	if (notes.length === 0) {
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
		const msg = messages[view];
		return (
			<div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
				<p className="text-lg">{msg.title}</p>
				<p className="text-sm">{msg.subtitle}</p>
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
