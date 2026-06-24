import { useQuery } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useAnalytics = (workspaceId) => {
  return useQuery({
    queryKey: ['analytics', workspaceId],
    queryFn: () => fetchClient(`/workspaces/${workspaceId}/analytics`),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, 
  });
};