import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useProjects = (workspaceId) => {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => fetchClient(`/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId,
  });
};

export const useCreateProject = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetchClient(`/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] }),
  });
};

export const useDeleteProject = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) =>
      fetchClient(`/workspaces/${workspaceId}/projects/${projectId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] }),
  });
};