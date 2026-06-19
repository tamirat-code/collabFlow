import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchClient } from '../api/fetchClient';

export const useBillingInfo = (workspaceId) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get('success');

  
  useEffect(() => {
    if (success === 'true' && workspaceId) {
      queryClient.invalidateQueries({ queryKey: ['billing', workspaceId] });
      
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      
      setSearchParams({});
    }
  }, [success, workspaceId]);

  return useQuery({
    queryKey: ['billing', workspaceId],
    queryFn: () => fetchClient(`/billing/${workspaceId}/status`),
    enabled: !!workspaceId,
    staleTime: 0, 
  });
};

export const useCreateCheckout = (workspaceId) => {
  return useMutation({
    mutationFn: (plan) => {
      if (!workspaceId) throw new Error("Missing workspaceId");
      return fetchClient(`/billing/${workspaceId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ plan }),
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