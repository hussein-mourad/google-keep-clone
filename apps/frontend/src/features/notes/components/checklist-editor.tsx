import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NoteChecklistItem } from "../types";

function uid(): string {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createChecklistItem(): NoteChecklistItem {
	return { id: uid(), text: "", checked: false };
}

interface ChecklistEditorProps {
	items: NoteChecklistItem[];
	onChange: (items: NoteChecklistItem[]) => void;
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const [focusIndex, setFocusIndex] = useState<number | null>(null);
	const checkedCount = items.filter((item) => item.checked).length;

	useEffect(() => {
		if (focusIndex !== null) {
			inputRefs.current[focusIndex]?.focus();
			setFocusIndex(null);
		}
	}, [focusIndex]);

	function updateItem(id: string, patch: Partial<NoteChecklistItem>) {
		onChange(
			items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
		);
	}

	function removeItem(id: string) {
		onChange(items.filter((item) => item.id !== id));
	}

	function insertItemAfter(index: number) {
		const next = [...items];
		next.splice(index + 1, 0, createChecklistItem());
		onChange(next);
		setFocusIndex(index + 1);
	}

	function appendItem() {
		onChange([...items, createChecklistItem()]);
		setFocusIndex(items.length);
	}

	return (
		<div className="space-y-1 py-1">
			{items.map((item, index) => (
				<div key={item.id} className="group/item flex items-center gap-2">
					<input
						type="checkbox"
						checked={item.checked}
						onChange={() => updateItem(item.id, { checked: !item.checked })}
						title={item.checked ? "Mark as not done" : "Mark as done"}
						className="size-4 shrink-0 cursor-pointer accent-current"
					/>
					<input
						type="text"
						value={item.text}
						placeholder="List item"
						onChange={(e) => updateItem(item.id, { text: e.target.value })}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								insertItemAfter(index);
							}
						}}
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						className={`w-full bg-transparent text-sm outline-none ${
							item.checked ? "line-through opacity-60" : ""
						}`}
					/>
					<button
						type="button"
						onClick={() => removeItem(item.id)}
						title="Delete item"
						className="flex size-6 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-current/10 group-hover/item:opacity-100 focus-visible:opacity-100"
					>
						<XIcon className="size-4" />
					</button>
				</div>
			))}
			<button
				type="button"
				onClick={appendItem}
				className="flex items-center gap-1 rounded-full px-2 py-1 text-xs opacity-70 transition-opacity hover:bg-current/10 hover:opacity-100"
				title="Add item"
			>
				<PlusIcon className="size-3.5" />
				Add item
			</button>
			{items.length > 0 && (
				<div className="flex items-center gap-2 pt-1">
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
			)}
		</div>
	);
}

export function ChecklistProgress({ items }: { items: NoteChecklistItem[] }) {
	if (items.length === 0) return null;
	const checkedCount = items.filter((item) => item.checked).length;
	return (
		<div className="flex items-center gap-2 px-4 pb-2">
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
