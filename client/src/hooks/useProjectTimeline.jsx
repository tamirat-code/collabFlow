import { useQuery } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useProjectTimeline = (workspaceId, projectId) => {
  return useQuery({
    queryKey: ['timeline', projectId],
    queryFn: () => fetchClient(`/workspaces/${workspaceId}/projects/${projectId}/timeline`),
    enabled: !!projectId,
  });
};