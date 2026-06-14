import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetchClient('/workspaces'),
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetchClient('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId) =>
      fetchClient(`/workspaces/${workspaceId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  });
};

export const useInviteMember = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetchClient(`/workspaces/${workspaceId}/invite`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }),
  });
};