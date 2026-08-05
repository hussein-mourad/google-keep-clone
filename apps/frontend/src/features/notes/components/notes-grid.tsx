import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "#/lib/utils";
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
	onReorder?: (activeId: number, overId: number) => void;
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

function SortableNoteCard({
	note,
	onClick,
	onTogglePin,
	onArchive,
	onTrash,
	onRestore,
	onPermanentDelete,
	view,
}: {
	note: Note;
	onClick: (note: Note) => void;
	onTogglePin?: (note: Note) => void;
	onArchive?: (note: Note) => void;
	onTrash?: (note: Note) => void;
	onRestore?: (note: Note) => void;
	onPermanentDelete?: (note: Note) => void;
	view?: "notes" | "archived" | "trash";
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: note.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"mb-4 w-full break-inside-avoid",
				isDragging && "z-50 shadow-xl",
			)}
		>
			<div className="group/drag relative">
				<button
					type="button"
					className="absolute -left-1 top-1/2 z-10 -translate-y-1/2 cursor-grab rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 active:cursor-grabbing group-hover/drag:opacity-100"
					{...attributes}
					{...listeners}
				>
					<GripVerticalIcon className="size-4" />
				</button>
				<NoteCard
					note={note}
					onClick={onClick}
					onTogglePin={onTogglePin}
					onArchive={onArchive}
					onTrash={onTrash}
					onRestore={onRestore}
					onPermanentDelete={onPermanentDelete}
					view={view}
				/>
			</div>
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
	onReorder,
	view,
	layout,
}: NotesGridProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const strategy =
		layout === "list" ? verticalListSortingStrategy : rectSortingStrategy;

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id || !onReorder) return;
		onReorder(active.id as number, over.id as number);
	}

	const list = notes.map((note) => (
		<SortableNoteCard
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
	));

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={notes.map((n) => n.id)} strategy={strategy}>
				{layout === "list" ? (
					<div className="mx-auto flex max-w-2xl flex-col gap-3">{list}</div>
				) : (
					<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
						{list}
					</div>
				)}
			</SortableContext>
		</DndContext>
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
