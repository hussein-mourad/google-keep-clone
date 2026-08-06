import {
	ArchiveIcon,
	ArchiveRestoreIcon,
	CheckIcon,
	CopyIcon,
	DownloadIcon,
	PinIcon,
	Trash2Icon,
	Undo2Icon,
} from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { Badge } from "#/components/ui/badge";
import type { Note } from "../types";
import { ChecklistProgress } from "./checklist-progress";

interface NoteCardProps {
	note: Note;
	onClick: (note: Note) => void;
	onTogglePin?: (note: Note) => void;
	onArchive?: (note: Note) => void;
	onTrash?: (note: Note) => void;
	onRestore?: (note: Note) => void;
	onPermanentDelete?: (note: Note) => void;
	onDuplicate?: (note: Note) => void;
	onExport?: (note: Note) => void;
	view?: "notes" | "archived" | "trash";
}

function IconButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			type="button"
			className="flex size-8 items-center justify-center rounded-full opacity-60 transition-all group-hover/card:opacity-100 hover:opacity-100 hover:bg-current/10"
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
	onDuplicate,
	onExport,
	view = "notes",
}: NoteCardProps) {
	const preview = note.content.slice(0, 150);
	const hasMore = note.content.length > 150;

	return (
		// biome-ignore lint/a11y/useSemanticElements: card wrapper needs div for nested buttons
		<div
			className="group/card relative w-full cursor-pointer break-inside-avoid rounded-lg border border-border bg-card text-start transition-all hover:shadow-sm"
			style={
				note.color
					? { backgroundColor: note.color, color: "#202124" }
					: undefined
			}
			onClick={() => onClick(note)}
			onKeyDown={(e) => {
				if (e.key === "Enter") onClick(note);
			}}
			role="button"
			tabIndex={0}
		>
			{note.isPinned && (
				<PinIcon className="absolute right-2 top-2 size-4 rotate-45 opacity-60" />
			)}
			{note.images && note.images.length > 0 && (
				<div className="w-full columns-2 gap-2 overflow-hidden rounded-t-lg p-2 pb-0">
					{note.images.map((image) => (
						<img
							key={image.id}
							src={image.presignedUrl}
							alt={image.filename}
							className="mb-2 max-h-40 w-full break-inside-avoid rounded-md object-contain"
							loading="lazy"
							style={
								image.width && image.height
									? {
											aspectRatio: `${image.width} / ${image.height}`,
										}
									: undefined
							}
						/>
					))}
				</div>
			)}
			<div className="p-4 pb-2">
				{note.title && (
					<h3 className="mb-1 text-sm font-semibold leading-snug">
						{note.title}
					</h3>
				)}
				{note.isChecklist && Array.isArray(note.checklist) ? (
					<ul className="space-y-1">
						{note.checklist.map((item) => (
							<li key={item.id} className="flex items-start gap-2">
								<span
									aria-hidden="true"
									className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
										item.checked
											? "border-current bg-current text-background"
											: "border-current/60"
									}`}
								>
									{item.checked && <CheckIcon className="size-2.5" />}
								</span>
								<span
									className={`text-sm leading-relaxed ${
										item.checked ? "line-through opacity-60" : ""
									}`}
								>
									{item.text}
								</span>
							</li>
						))}
					</ul>
				) : (
					note.content && (
						<p
							className={`whitespace-pre-wrap text-sm leading-relaxed ${
								note.color ? "" : "text-foreground/85"
							}`}
						>
							{preview}
							{hasMore && "..."}
						</p>
					)
				)}
			</div>
			{note.isChecklist &&
				Array.isArray(note.checklist) &&
				note.checklist.length > 0 && (
					<ChecklistProgress items={note.checklist} />
				)}
			{note.labels && note.labels.length > 0 && (
				<div className="flex flex-wrap gap-1 px-4 pb-2">
					{note.labels.map((label) => (
						<Badge key={label.id} variant="secondary" className="text-[10px]">
							{label.name}
						</Badge>
					))}
				</div>
			)}
			<div className="flex items-center gap-0.5 px-2 py-1">
				{view === "notes" && (
					<>
						{onTogglePin && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onTogglePin(note);
								}}
								title={note.isPinned ? "Unpin" : "Pin"}
							>
								<PinIcon
									className={`size-4 ${note.isPinned ? "rotate-45" : ""}`}
								/>
							</IconButton>
						)}
						{onArchive && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onArchive(note);
								}}
								title="Archive"
							>
								<ArchiveIcon className="size-4" />
							</IconButton>
						)}
						{onTrash && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onTrash(note);
								}}
								title="Delete"
							>
								<Trash2Icon className="size-4" />
							</IconButton>
						)}
						{onDuplicate && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onDuplicate(note);
								}}
								title="Make a copy"
							>
								<CopyIcon className="size-4" />
							</IconButton>
						)}
						{onExport && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onExport(note);
								}}
								title="Download as Markdown"
							>
								<DownloadIcon className="size-4" />
							</IconButton>
						)}
					</>
				)}
				{view === "archived" && (
					<>
						{onRestore && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onRestore(note);
								}}
								title="Unarchive"
							>
								<ArchiveRestoreIcon className="size-4" />
							</IconButton>
						)}
						{onTrash && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onTrash(note);
								}}
								title="Delete"
							>
								<Trash2Icon className="size-4" />
							</IconButton>
						)}
					</>
				)}
				{view === "trash" && (
					<>
						{onRestore && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onRestore(note);
								}}
								title="Restore"
							>
								<Undo2Icon className="size-4" />
							</IconButton>
						)}
						{onPermanentDelete && (
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onPermanentDelete(note);
								}}
								title="Delete forever"
							>
								<Trash2Icon className="size-4" />
							</IconButton>
						)}
					</>
				)}
			</div>
		</div>
	);
}
