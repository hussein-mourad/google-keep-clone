import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createNote,
	getNotes,
	permanentDeleteNote,
	reorderNotes,
	restoreNote,
	trashNote,
	updateNote,
} from "./api";
import type { CreateNoteInput, UpdateNoteInput } from "./types";

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

function invalidateNotes(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: ["notes"] });
}

export function useCreateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (note: CreateNoteInput) => createNote(note),
		onSuccess: () => invalidateNotes(queryClient),
	});
}

export function useUpdateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, note }: { id: number; note: UpdateNoteInput }) =>
			updateNote(id, note),
		onSuccess: () => invalidateNotes(queryClient),
	});
}

export function useTrashNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: trashNote,
		onSuccess: () => invalidateNotes(queryClient),
	});
}

export function useRestoreNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: restoreNote,
		onSuccess: () => invalidateNotes(queryClient),
	});
}

export function usePermanentDeleteNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: permanentDeleteNote,
		onSuccess: () => invalidateNotes(queryClient),
	});
}

export function useReorderNotes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reorderNotes,
		onError: () => invalidateNotes(queryClient),
	});
}
