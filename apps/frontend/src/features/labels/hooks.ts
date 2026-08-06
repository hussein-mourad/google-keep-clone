import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
	});
}

export function useDeleteLabel() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteLabel,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: labelsQueryKey });
		},
	});
}
