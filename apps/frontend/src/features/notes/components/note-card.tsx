import { Card, CardContent } from "#/components/ui/card";
import type { Note } from "../types";

interface NoteCardProps {
	note: Note;
	onClick: (note: Note) => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
	const preview = note.content.slice(0, 150);
	const hasMore = note.content.length > 150;

	return (
		<Card
			className="cursor-pointer break-inside-avoid transition-shadow hover:shadow-lg"
			onClick={() => onClick(note)}
		>
			<CardContent className="pt-(--card-spacing)">
				<h3 className="mb-1 text-sm font-medium leading-snug">{note.title}</h3>
				<p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
					{preview}
					{hasMore && "..."}
				</p>
			</CardContent>
		</Card>
	);
}
