import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

const base = (wid, pid, tid) => `/workspaces/${wid}/projects/${pid}/tasks/${tid}`;

export const useComments = (workspaceId, projectId, taskId) =>
  useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => fetchClient(`${base(workspaceId, projectId, taskId)}/comments`),
    enabled: !!taskId,
  });

export const useActivity = (workspaceId, projectId, taskId) =>
  useQuery({
    queryKey: ['activity', taskId],
    queryFn: () => fetchClient(`${base(workspaceId, projectId, taskId)}/activity`),
    enabled: !!taskId,
  });

export const useAddComment = (workspaceId, projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content) =>
      fetchClient(`${base(workspaceId, projectId, taskId)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', taskId] });
      qc.invalidateQueries({ queryKey: ['activity', taskId] });
    },
  });
};

export const useDeleteComment = (workspaceId, projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) =>
      fetchClient(`${base(workspaceId, projectId, taskId)}/comments/${commentId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
  });
};