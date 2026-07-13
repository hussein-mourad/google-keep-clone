import { Dialog, DialogContent } from "#/components/ui/dialog";
import { NoteForm } from "./note-form";

interface CreateNoteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (note: { title: string; content: string }) => Promise<void>;
}

export function CreateNoteDialog({
	open,
	onOpenChange,
	onSubmit,
}: CreateNoteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<NoteForm onSubmit={onSubmit} submitLabel="Create" />
			</DialogContent>
		</Dialog>
	);
}
