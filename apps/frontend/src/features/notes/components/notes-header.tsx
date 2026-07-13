import { ArchiveIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { ModeToggle } from "#/components/theme/toggle";
import { Button } from "#/components/ui/button";
import type { Label } from "#/features/labels/types";
import { FilterDropdown } from "./filter-dropdown";
import { ProfileDropdown } from "./profile-dropdown";

interface NotesHeaderProps {
	labels: Label[];
	filterLabelId?: number;
	onFilterChange: (labelId: number | undefined) => void;
	onNewNote: () => void;
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
	search: string;
	onSearchChange: (search: string) => void;
	view: "notes" | "archived" | "trash";
	onViewChange: (view: "notes" | "archived" | "trash") => void;
}

export function NotesHeader({
	labels,
	filterLabelId,
	onFilterChange,
	onNewNote,
	user,
	search,
	onSearchChange,
	view,
	onViewChange,
}: NotesHeaderProps) {
	return (
		<header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-medium">
					{view === "notes"
						? "Notes"
						: view === "archived"
							? "Archive"
							: "Trash"}
				</h1>
				<div className="flex items-center gap-2">
					<FilterDropdown
						labels={labels}
						activeLabelId={view === "notes" ? filterLabelId : undefined}
						onChange={onFilterChange}
					/>
					{view === "notes" && (
						<Button onClick={onNewNote}>
							<PlusIcon className="size-4" />
							New Note
						</Button>
					)}
					<ProfileDropdown user={user} />
					<ModeToggle />
				</div>
			</div>
			<div className="mt-2 flex items-center gap-2">
				<div className="relative flex-1">
					<SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search notes..."
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</div>
				<div className="flex items-center rounded-md border p-0.5">
					<button
						type="button"
						className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
							view === "notes"
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => onViewChange("notes")}
					>
						Notes
					</button>
					<button
						type="button"
						className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
							view === "archived"
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => onViewChange("archived")}
					>
						<ArchiveIcon className="size-3" />
						Archive
					</button>
					<button
						type="button"
						className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
							view === "trash"
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => onViewChange("trash")}
					>
						<Trash2Icon className="size-3" />
						Trash
					</button>
				</div>
			</div>
		</header>
	);
}
