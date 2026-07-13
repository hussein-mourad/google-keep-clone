import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { createLabel, deleteLabel, getLabels } from "#/features/labels/api";
import type { Label } from "#/features/labels/types";

interface LabelPickerProps {
	selectedIds: number[];
	onChange: (ids: number[]) => void;
}

export function LabelPicker({ selectedIds, onChange }: LabelPickerProps) {
	const [labels, setLabels] = useState<Label[]>([]);
	const [newLabelName, setNewLabelName] = useState("");
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		getLabels()
			.then(setLabels)
			.catch(() => {});
	}, []);

	async function handleCreate() {
		const name = newLabelName.trim();
		if (!name) return;
		setCreating(true);
		try {
			const label = await createLabel(name);
			setLabels((prev) => [...prev, label]);
			onChange([...selectedIds, label.id]);
			setNewLabelName("");
		} catch {
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(id: number) {
		await deleteLabel(id);
		setLabels((prev) => prev.filter((l) => l.id !== id));
		onChange(selectedIds.filter((sid) => sid !== id));
	}

	function toggleLabel(id: number) {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((sid) => sid !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	}

	return (
		<div className="space-y-2">
			{labels.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{labels.map((label) => (
						<Badge
							key={label.id}
							variant={selectedIds.includes(label.id) ? "default" : "outline"}
							className="cursor-pointer"
							onClick={() => toggleLabel(label.id)}
						>
							{label.name}
							<button
								type="button"
								className="ml-0.5 rounded-full hover:bg-foreground/20"
								onClick={(e) => {
									e.stopPropagation();
									handleDelete(label.id);
								}}
							>
								<XIcon className="size-2.5" />
							</button>
						</Badge>
					))}
				</div>
			)}
			<div className="flex gap-1">
				<Input
					placeholder="New label..."
					value={newLabelName}
					onChange={(e) => setNewLabelName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleCreate();
						}
					}}
					className="h-7 text-xs"
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 px-2"
					disabled={!newLabelName.trim() || creating}
					onClick={handleCreate}
				>
					<PlusIcon className="size-3" />
				</Button>
			</div>
		</div>
	);
}
