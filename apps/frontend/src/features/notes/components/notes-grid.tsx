import type { Note } from "../types";
import { NoteCard } from "./note-card";

interface NotesGridProps {
	notes: Note[];
	onNoteClick: (note: Note) => void;
}

export function NotesGrid({ notes, onNoteClick }: NotesGridProps) {
	if (notes.length === 0) {
		return (
			<div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
				<p className="text-lg">No notes yet</p>
				<p className="text-sm">Create your first note to get started</p>
			</div>
		);
	}

	return (
		<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
			{notes.map((note) => (
				<NoteCard key={note.id} note={note} onClick={onNoteClick} />
			))}
		</div>
	);
}
