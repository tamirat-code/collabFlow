import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchClient } from '../api/fetchClient';

// Separated from useBillingInfo so it can be used outside a Router context (e.g. Profile page)
export const useBillingInfo = (workspaceId) => {
  return useQuery({
    queryKey: ['billing', workspaceId],
    queryFn:  () => fetchClient(`/billing/${workspaceId}/status`),
    enabled:  !!workspaceId,
    staleTime: 0,
  });
};

// Only use this hook inside a page that is rendered inside <BrowserRouter>
// It handles the ?success=true redirect from Stripe and refreshes billing state
export const useBillingSuccessHandler = (workspaceId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true' && workspaceId) {
      queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Clean the query string without a full navigation
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [workspaceId, queryClient]);
};

export const useCreateCheckout = (workspaceId) => {
  return useMutation({
    mutationFn: (plan) => {
      if (!workspaceId) throw new Error('Missing workspaceId');
      return fetchClient(`/billing/${workspaceId}/checkout`, {
        method: 'POST',
        body:   JSON.stringify({ plan }),
      });
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (err) => {
      alert(err.message || 'Failed to create checkout session. Please try again.');
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
    onError: (err) => {
      alert(err.message);
    },
  });
};