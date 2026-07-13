import { TagIcon, XIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import type { Label } from "#/features/labels/types";

interface FilterDropdownProps {
	labels: Label[];
	activeLabelId?: number;
	onChange: (labelId: number | undefined) => void;
}

export function FilterDropdown({
	labels,
	activeLabelId,
	onChange,
}: FilterDropdownProps) {
	const activeLabel = labels.find((l) => l.id === activeLabelId);

	return (
		<>
			{activeLabelId && activeLabel && (
				<div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
					<TagIcon className="size-3" />
					{activeLabel.name}
					<button
						type="button"
						onClick={() => onChange(undefined)}
						className="ml-0.5 rounded-full hover:bg-foreground/20"
					>
						<XIcon className="size-3" />
					</button>
				</div>
			)}
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
					<TagIcon className="size-4" />
					Filter
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => onChange(undefined)}>
						All notes
					</DropdownMenuItem>
					{labels.map((label) => (
						<DropdownMenuItem key={label.id} onClick={() => onChange(label.id)}>
							{label.name}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
