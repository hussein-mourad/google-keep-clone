import { ArchiveIcon, PinIcon, Trash2Icon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader } from "#/components/ui/card";
import type { Note } from "../types";

interface NoteCardProps {
	note: Note;
	onClick: (note: Note) => void;
	onTogglePin?: (note: Note) => void;
	onArchive?: (note: Note) => void;
	onTrash?: (note: Note) => void;
	onRestore?: (note: Note) => void;
	onPermanentDelete?: (note: Note) => void;
	view?: "notes" | "archived" | "trash";
}

function IconButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			className="flex size-7 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-foreground/10 group-hover/card:opacity-100"
			{...props}
		/>
	);
}

export function NoteCard({
	note,
	onClick,
	onTogglePin,
	onArchive,
	onTrash,
	onRestore,
	onPermanentDelete,
	view = "notes",
}: NoteCardProps) {
	const preview = note.content.slice(0, 150);
	const hasMore = note.content.length > 150;

	return (
		<Card
			className="group/card cursor-pointer break-inside-avoid transition-shadow hover:shadow-lg gap-1 relative"
			style={note.color ? { backgroundColor: note.color } : undefined}
			onClick={() => onClick(note)}
		>
			{note.isPinned && (
				<PinIcon className="absolute right-2 top-2 size-4 rotate-45 text-muted-foreground" />
			)}
			<CardHeader className="pb-0">
				<h3 className="text-sm font-medium leading-snug">{note.title}</h3>
			</CardHeader>
			<CardContent className="pt-1 space-y-2">
				{note.content && (
					<p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
						{preview}
						{hasMore && "..."}
					</p>
				)}
				{note.labels && note.labels.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{note.labels.map((label) => (
							<Badge key={label.id} variant="secondary" className="text-[10px]">
								{label.name}
							</Badge>
						))}
					</div>
				)}
				<div className="flex items-center gap-0.5 pt-1">
					{view === "notes" && (
						<>
							{onTogglePin && (
								<IconButton
									onClick={(e) => {
										e.stopPropagation();
										onTogglePin(note);
									}}
								>
									<PinIcon className="size-3.5" />
								</IconButton>
							)}
							{onArchive && (
								<IconButton
									onClick={(e) => {
										e.stopPropagation();
										onArchive(note);
									}}
								>
									<ArchiveIcon className="size-3.5" />
								</IconButton>
							)}
							{onTrash && (
								<IconButton
									onClick={(e) => {
										e.stopPropagation();
										onTrash(note);
									}}
								>
									<Trash2Icon className="size-3.5" />
								</IconButton>
							)}
						</>
					)}
					{view === "archived" && onRestore && (
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								onRestore(note);
							}}
						>
							<ArchiveIcon className="size-3.5" />
						</IconButton>
					)}
					{view === "trash" && (
						<>
							{onRestore && (
								<IconButton
									onClick={(e) => {
										e.stopPropagation();
										onRestore(note);
									}}
								>
									<ArchiveIcon className="size-3.5" />
								</IconButton>
							)}
							{onPermanentDelete && (
								<IconButton
									onClick={(e) => {
										e.stopPropagation();
										onPermanentDelete(note);
									}}
								>
									<Trash2Icon className="size-3.5" />
								</IconButton>
							)}
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
