import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/api";
import { createLabel, deleteLabel, getLabels } from "./api";

export const labelsQueryKey = ["labels"] as const;

export function useLabels() {
	return useQuery({
		queryKey: labelsQueryKey,
		queryFn: getLabels,
	});
}

export function useCreateLabel() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createLabel,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: labelsQueryKey });
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}

export function useDeleteLabel() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteLabel,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: labelsQueryKey });
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
