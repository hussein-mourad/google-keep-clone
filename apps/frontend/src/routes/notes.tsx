import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, PlusIcon, TagIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";
import { ProtectedRoute } from "#/components/protected-route";
import { ModeToggle } from "#/components/theme/toggle";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "#/components/ui/dropdown-menu";
import {
	createNote,
	deleteNote,
	getNotes,
	updateNote,
} from "#/features/notes/api";
import { getLabels } from "#/features/labels/api";
import type { Label } from "#/features/labels/types";
import { CreateNoteDialog } from "#/features/notes/components/create-note-dialog";
import { EditNoteDialog } from "#/features/notes/components/edit-note-dialog";
import { NotesGrid } from "#/features/notes/components/notes-grid";
import type { Note } from "#/features/notes/types";

export const Route = createFileRoute("/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [labels, setLabels] = useState<Label[]>([]);
	const [filterLabelId, setFilterLabelId] = useState<number | undefined>();

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/" });
	};

	async function loadNotes() {
		try {
			const data = await getNotes(filterLabelId);
			setNotes(data);
		} catch {
			setNotes([]);
		} finally {
			setLoading(false);
		}
	}

	async function loadLabels() {
		try {
			const data = await getLabels();
			setLabels(data);
		} catch {
			setLabels([]);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only fetch
	useEffect(() => {
		loadLabels();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reload when filter changes
	useEffect(() => {
		loadNotes();
	}, [filterLabelId]);

	async function handleCreate(note: {
		title: string;
		content: string;
		labelIds: number[];
	}) {
		await createNote(note);
		setCreateOpen(false);
		await loadNotes();
	}

	async function handleUpdate(
		id: number,
		note: { title: string; content: string; labelIds: number[] },
	) {
		await updateNote(id, note);
		setEditingNote(null);
		await loadNotes();
	}

	async function handleDelete(id: number) {
		await deleteNote(id);
		setEditingNote(null);
		await loadNotes();
	}

	const activeLabel = labels.find((l) => l.id === filterLabelId);
	const user = session?.user;

	return (
		<ProtectedRoute>
			<div className="min-h-screen">
				<header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
					<h1 className="text-lg font-medium">Notes</h1>
					<div className="flex items-center gap-2">
						{filterLabelId && activeLabel && (
							<div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
								<TagIcon className="size-3" />
								{activeLabel.name}
								<button
									type="button"
									onClick={() => setFilterLabelId(undefined)}
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
								<DropdownMenuItem onClick={() => setFilterLabelId(undefined)}>
									All notes
								</DropdownMenuItem>
								{labels.map((label) => (
									<DropdownMenuItem
										key={label.id}
										onClick={() => setFilterLabelId(label.id)}
									>
										{label.name}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<Button onClick={() => setCreateOpen(true)}>
							<PlusIcon className="size-4" />
							New Note
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button variant="ghost" size="icon" className="rounded-full">
										<Avatar>
											<AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
											<AvatarFallback>{(user?.name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
										</Avatar>
									</Button>
								}
							/>
							<DropdownMenuContent align="end" className="min-w-48">
								<DropdownMenuGroup>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col gap-0.5">
											<p className="text-sm font-medium">{user?.name}</p>
											<p className="text-xs text-muted-foreground">
												{user?.email}
											</p>
										</div>
									</DropdownMenuLabel>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleSignOut}>
									<LogOutIcon className="size-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<ModeToggle />
					</div>
				</header>
				<main className="mx-auto max-w-7xl p-4">
					{loading ? (
						<div className="flex items-center justify-center py-20">
							<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						</div>
					) : (
						<NotesGrid notes={notes} onNoteClick={setEditingNote} />
					)}
				</main>
				<CreateNoteDialog
					open={createOpen}
					onOpenChange={setCreateOpen}
					onSubmit={handleCreate}
				/>
				<EditNoteDialog
					note={editingNote}
					onOpenChange={() => setEditingNote(null)}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			</div>
		</ProtectedRoute>
	);
}
