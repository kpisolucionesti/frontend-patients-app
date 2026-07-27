import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useApiQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    staleTime: options.staleTime ?? 60 * 1000,
    gcTime: options.gcTime ?? 5 * 60 * 1000,
    retry: options.retry ?? 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useApiMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
        });
      }
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
