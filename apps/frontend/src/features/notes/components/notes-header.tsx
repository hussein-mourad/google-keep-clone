import { LayoutGridIcon, ListIcon, SearchIcon } from "lucide-react";
import { ModeToggle } from "#/components/theme/toggle";
import { Button } from "#/components/ui/button";
import { SidebarTrigger } from "#/components/ui/sidebar";
import { ProfileDropdown } from "./profile-dropdown";

interface NotesHeaderProps {
	search: string;
	onSearchChange: (search: string) => void;
	layout: "grid" | "list";
	onLayoutChange: (layout: "grid" | "list") => void;
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
	user,
}: NotesHeaderProps) {
	return (
		<header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-2">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<div className="flex items-center gap-2">
					<div className="size-8 rounded-full bg-amber-400 p-1.5">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							className="size-5 text-white"
							aria-label="Keep"
						>
							<title>Keep</title>
							<path
								d="M12 2L2 7l10 5 10-5-10-5z"
								fill="currentColor"
								opacity="0.7"
							/>
							<path d="M2 17l10 5 10-5" fill="currentColor" opacity="0.5" />
							<path d="M2 12l10 5 10-5" fill="currentColor" opacity="0.9" />
						</svg>
					</div>
					<span className="text-lg font-medium">Keep</span>
				</div>
			</div>

			<div className="mx-auto flex max-w-xl flex-1">
				<div className="relative w-full">
					<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
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
