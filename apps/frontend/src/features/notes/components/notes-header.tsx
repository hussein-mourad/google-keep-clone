import { PlusIcon } from "lucide-react";
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
}

export function NotesHeader({
	labels,
	filterLabelId,
	onFilterChange,
	onNewNote,
	user,
}: NotesHeaderProps) {
	return (
		<header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
			<h1 className="text-lg font-medium">Notes</h1>
			<div className="flex items-center gap-2">
				<FilterDropdown
					labels={labels}
					activeLabelId={filterLabelId}
					onChange={onFilterChange}
				/>
				<Button onClick={onNewNote}>
					<PlusIcon className="size-4" />
					New Note
				</Button>
				<ProfileDropdown user={user} />
				<ModeToggle />
			</div>
		</header>
	);
}
