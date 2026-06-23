import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useTasks = (workspaceId, projectId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)   params.set('search',   filters.search);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assignee) params.set('assignee', filters.assignee);
  if (filters.status)   params.set('status',   filters.status);
  if (filters.overdue)  params.set('overdue',  'true');
  const qs = params.toString();

  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => fetchClient(`/workspaces/${workspaceId}/projects/${projectId}/tasks${qs ? '?' + qs : ''}`),
    enabled: !!projectId,
  });
};

export const useCreateTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      fetchClient(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};

export const useUpdateTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...data }) =>
      fetchClient(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};

export const useMoveTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, order }) =>
      fetchClient(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/move`, {
        method: 'PUT',
        body: JSON.stringify({ status, order }),
      }),
    
    onMutate: async ({ taskId, status, order }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = queryClient.getQueryData(['tasks', projectId]);

      queryClient.setQueryData(['tasks', projectId], (old) =>
        old?.map((t) => (t._id === taskId ? { ...t, status, order } : t))
      );

      return { previous };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['tasks', projectId], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};

export const useDeleteTask = (workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) =>
      fetchClient(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
};