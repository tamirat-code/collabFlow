import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchClient } from '../api/fetchClient';

export const useBillingInfo = (workspaceId) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get('success');

  // When Stripe redirects back with ?success=true, invalidate and refetch
  useEffect(() => {
    if (success === 'true' && workspaceId) {
      queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
      // Also invalidate workspaces so sidebar plan badge updates
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Remove the query param so it doesn't keep refetching
      setSearchParams({});
    }
  }, [success, workspaceId]);

  return useQuery({
    queryKey: ['billing', workspaceId],
    queryFn: () => fetchClient(`/billing/${workspaceId}/status`),
    enabled: !!workspaceId,
    staleTime: 0, // always refetch on mount
  });
};

export const useCreateCheckout = (workspaceId) => {
  return useMutation({
    mutationFn: (plan) =>
      fetchClient(`/billing/${workspaceId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ plan }),
      }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
};

export const usePortal = (workspaceId) => {
  return useMutation({
    mutationFn: () =>
      fetchClient(`/billing/${workspaceId}/portal`, { method: 'POST' }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });
};