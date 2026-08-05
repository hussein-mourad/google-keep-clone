import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
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
import { useState } from "react";
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
	onReorderLive?: (activeId: number, overId: number) => void;
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
	} = useSortable({
		id: note.id,
		transition: {
			duration: 150,
			easing: "cubic-bezier(0.25, 1, 0.5, 1)",
		},
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"mb-4 w-full break-inside-avoid",
				isDragging && "opacity-0",
			)}
			{...attributes}
			{...listeners}
		>
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
	onReorderLive,
	view,
	layout,
}: NotesGridProps) {
	const [activeId, setActiveId] = useState<number | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const strategy =
		layout === "list" ? verticalListSortingStrategy : rectSortingStrategy;

	function handleDragStart(event: DragStartEvent) {
		setActiveId(event.active.id as number);
	}

	function handleDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id || !onReorderLive) return;
		// Reorder live during drag so CSS columns reflow naturally (smooth masonry).
		onReorderLive(active.id as number, over.id as number);
	}

	function handleDragEnd(event: DragEndEvent) {
		setActiveId(null);
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

	const activeNote = notes.find((n) => n.id === activeId) ?? null;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
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
			<DragOverlay dropAnimation={null}>
				{activeNote && (
					<div className="pointer-events-none">
						<NoteCard
							note={activeNote}
							onClick={() => {}}
							onTogglePin={onTogglePin}
							onArchive={onArchive}
							onTrash={onTrash}
							onRestore={onRestore}
							onPermanentDelete={onPermanentDelete}
							view={view}
						/>
					</div>
				)}
			</DragOverlay>
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
