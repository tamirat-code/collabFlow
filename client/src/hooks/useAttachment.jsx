import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

const base = (wid, pid, tid) =>
  `/workspaces/${wid}/projects/${pid}/tasks/${tid}/attachments`;

export const useAttachments = (workspaceId, projectId, taskId) =>
  useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => fetchClient(base(workspaceId, projectId, taskId)),
    enabled: !!taskId,
  });

export const useUploadAttachment = (workspaceId, projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetchClient(base(workspaceId, projectId, taskId), {
        method: 'POST',
        body: formData,
        
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', taskId] });
      qc.invalidateQueries({ queryKey: ['activity', taskId] });
    },
  });
};

export const useDeleteAttachment = (workspaceId, projectId, taskId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId) =>
      fetchClient(`${base(workspaceId, projectId, taskId)}/${attachmentId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments', taskId] }),
  });
};