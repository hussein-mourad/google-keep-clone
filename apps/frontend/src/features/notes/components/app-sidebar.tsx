import { ArchiveIcon, FileTextIcon, TagIcon, Trash2Icon } from "lucide-react";
import type * as React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "#/components/ui/sidebar";
import type { Label } from "#/features/labels/types";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	view: "notes" | "archived" | "trash";
	onViewChange: (view: "notes" | "archived" | "trash") => void;
	labels: Label[];
	filterLabelId?: number;
	onFilterChange: (labelId: number | undefined) => void;
}

const NAV_ITEMS = [
	{
		id: "notes" as const,
		label: "Notes",
		icon: FileTextIcon,
	},
	{
		id: "archived" as const,
		label: "Archive",
		icon: ArchiveIcon,
	},
	{
		id: "trash" as const,
		label: "Trash",
		icon: Trash2Icon,
	},
];

export function AppSidebar({
	view,
	onViewChange,
	labels,
	filterLabelId,
	onFilterChange,
	...props
}: AppSidebarProps) {
	return (
		<Sidebar
			collapsible="icon"
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			{...props}
		>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{NAV_ITEMS.map((item) => (
								<SidebarMenuItem key={item.id}>
									<SidebarMenuButton
										isActive={view === item.id && !filterLabelId}
										tooltip={item.label}
										onClick={() => {
											onViewChange(item.id);
											onFilterChange(undefined);
										}}
									>
										<item.icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarSeparator />
				<SidebarGroup>
					<SidebarGroupLabel>Labels</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{labels.map((label) => (
								<SidebarMenuItem key={label.id}>
									<SidebarMenuButton
										isActive={filterLabelId === label.id}
										tooltip={label.name}
										onClick={() => {
											onViewChange("notes");
											onFilterChange(label.id);
										}}
									>
										<TagIcon />
										<span>{label.name}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
