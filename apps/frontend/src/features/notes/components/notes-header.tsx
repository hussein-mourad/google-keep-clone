import {
	LayoutGridIcon,
	ListIcon,
	SearchIcon,
	SidebarIcon,
} from "lucide-react";
import type { RefObject } from "react";
import { ModeToggle } from "#/components/theme/toggle";
import { Button } from "#/components/ui/button";
import { useSidebar } from "#/components/ui/sidebar";
import { ProfileDropdown } from "./profile-dropdown";

interface NotesHeaderProps {
	search: string;
	onSearchChange: (search: string) => void;
	layout: "grid" | "list";
	onLayoutChange: (layout: "grid" | "list") => void;
	searchInputRef?: RefObject<HTMLInputElement | null>;
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	} | null;
}

export function NotesHeader({
	search,
	onSearchChange,
	layout,
	onLayoutChange,
	searchInputRef,
	user,
}: NotesHeaderProps) {
	const { toggleSidebar } = useSidebar();

	return (
		<header className="sticky top-0 z-50 flex h-14 w-full items-center gap-4 border-b bg-background px-4">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
					<SidebarIcon className="size-4" />
				</Button>
				<div className="flex items-center gap-2">
					<img src="/icon-192.png" alt="Keep" className="size-8" />
					<span className="text-lg font-medium">Keep</span>
				</div>
			</div>

			<div className="mx-auto flex max-w-xl flex-1">
				<div className="relative w-full">
					<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						ref={searchInputRef}
						type="text"
						placeholder="Search"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className="h-10 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>
			</div>

			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => onLayoutChange("grid")}
					data-active={layout === "grid"}
					className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
					title="Grid view"
				>
					<LayoutGridIcon className="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => onLayoutChange("list")}
					data-active={layout === "list"}
					className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
					title="List view"
				>
					<ListIcon className="size-4" />
				</Button>
				<div className="mx-1 h-6 w-px bg-border" />
				<ProfileDropdown user={user} />
				<ModeToggle />
			</div>
		</header>
	);
}
