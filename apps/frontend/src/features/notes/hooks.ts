import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/api";
import {
	createNote,
	duplicateNote,
	emptyTrash,
	getNotes,
	permanentDeleteNote,
	reorderNotes,
	restoreNote,
	trashNote,
	updateNote,
} from "./api";
import type { CreateNoteInput, Note, UpdateNoteInput } from "./types";

export interface NotesQueryParams {
	labelId?: number;
	search?: string;
	archived?: boolean;
	trash?: boolean;
}

export const notesQueryKey = (params: NotesQueryParams) =>
	["notes", params] as const;

export function useNotes(params: NotesQueryParams) {
	return useQuery({
		queryKey: notesQueryKey(params),
		queryFn: () => getNotes(params),
	});
}

function invalidateNotes(queryClient: QueryClient) {
	queryClient.invalidateQueries({ queryKey: ["notes"] });
}

type NotesSnapshot = Array<[readonly unknown[], Note[] | undefined]>;

function notesParamsOf(key: readonly unknown[]): NotesQueryParams {
	return (key[1] ?? {}) as NotesQueryParams;
}

function snapshotNotes(queryClient: QueryClient): NotesSnapshot {
	return queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] });
}

function restoreNotes(
	queryClient: QueryClient,
	snapshot: NotesSnapshot | undefined,
) {
	if (!snapshot) return;
	for (const [key, data] of snapshot) {
		queryClient.setQueryData(key, data);
	}
}

function findNoteInCaches(queryClient: QueryClient, id: number): Note | null {
	for (const [, data] of snapshotNotes(queryClient)) {
		const note = data?.find((n) => n.id === id);
		if (note) return note;
	}
	return null;
}

type ApplyNotePatch = (
	id: number,
	params: NotesQueryParams,
	notes: Note[],
	source: Note | null,
) => Note[];

function optimisticallyUpdateNotes(
	queryClient: QueryClient,
	id: number,
	apply: ApplyNotePatch,
) {
	const source = findNoteInCaches(queryClient, id);
	for (const [queryKey, data] of snapshotNotes(queryClient)) {
		if (!data) continue;
		queryClient.setQueryData(
			queryKey,
			apply(id, notesParamsOf(queryKey), data, source),
		);
	}
}

function useOptimisticMutation<T>(
	mutationFn: (variables: T) => Promise<Note>,
	apply: ApplyNotePatch,
	getVariablesId: (variables: T) => number,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn,
		onMutate: async (variables: T) => {
			await queryClient.cancelQueries({ queryKey: ["notes"] });
			const previous = snapshotNotes(queryClient);
			optimisticallyUpdateNotes(queryClient, getVariablesId(variables), apply);
			return { previous };
		},
		onError: (error, _variables, context) => {
			restoreNotes(queryClient, context?.previous);
			toast.error(getErrorMessage(error));
		},
		onSettled: () => invalidateNotes(queryClient),
	});
}

export function useCreateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (note: CreateNoteInput) => createNote(note),
		onSuccess: () => invalidateNotes(queryClient),
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}

export function useUpdateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, note }: { id: number; note: UpdateNoteInput }) =>
			updateNote(id, note),
		onMutate: async ({ id, note }) => {
			await queryClient.cancelQueries({ queryKey: ["notes"] });
			const previous = snapshotNotes(queryClient);
			optimisticallyUpdateNotes(queryClient, id, (id, params, notes) => {
				const next = notes.map((n) => (n.id === id ? { ...n, ...note } : n));
				if (note.isArchived === true && !params.trash && !params.archived) {
					return next.filter((n) => n.id !== id);
				}
				if (note.isArchived === false && params.archived) {
					return next.filter((n) => n.id !== id);
				}
				return next;
			});
			return { previous };
		},
		onError: (error, _variables, context) => {
			restoreNotes(queryClient, context?.previous);
			toast.error(getErrorMessage(error));
		},
		onSettled: () => invalidateNotes(queryClient),
	});
}

export function useTrashNote() {
	return useOptimisticMutation<number>(
		trashNote,
		(id, params, notes) =>
			params.trash ? notes : notes.filter((n) => n.id !== id),
		(id) => id,
	);
}

export function useRestoreNote() {
	return useOptimisticMutation<number>(
		restoreNote,
		(id, params, notes, source) => {
			if (params.trash) {
				return notes.filter((n) => n.id !== id);
			}
			if (source && !params.archived && !notes.some((n) => n.id === id)) {
				return [
					{ ...source, isDeleted: false, isArchived: false, deletedAt: null },
					...notes,
				];
			}
			return notes;
		},
		(id) => id,
	);
}

export function usePermanentDeleteNote() {
	return useOptimisticMutation<number>(
		permanentDeleteNote,
		(id, params, notes) =>
			params.trash ? notes.filter((n) => n.id !== id) : notes,
		(id) => id,
	);
}

export function useReorderNotes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reorderNotes,
		onError: (error) => {
			invalidateNotes(queryClient);
			toast.error(getErrorMessage(error));
		},
	});
}

export function useDuplicateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: duplicateNote,
		onSuccess: () => invalidateNotes(queryClient),
	});
}

export function useEmptyTrash() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: emptyTrash,
		onSuccess: () => invalidateNotes(queryClient),
	});
}
