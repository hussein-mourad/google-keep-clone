import type { NoteChecklistItem } from "../types";

interface ChecklistProgressProps {
	items: NoteChecklistItem[];
	className?: string;
}

export function ChecklistProgress({
	items,
	className = "px-4 pb-2",
}: ChecklistProgressProps) {
	if (items.length === 0) return null;
	const checkedCount = items.filter((item) => item.checked).length;
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-current/15">
				<div
					className="h-full rounded-full bg-current"
					style={{
						width: `${Math.round((checkedCount / items.length) * 100)}%`,
					}}
				/>
			</div>
			<span className="text-[10px] opacity-70">
				{checkedCount}/{items.length}
			</span>
		</div>
	);
}
