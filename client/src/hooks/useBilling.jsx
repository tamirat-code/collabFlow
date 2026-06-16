import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useBillingInfo = (workspaceId) => {
  return useQuery({
    queryKey: ['billing', workspaceId],
    queryFn: () => fetchClient(`/billing/${workspaceId}`),
    enabled: !!workspaceId,
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