import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

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

export const useExportProject = (workspaceId, projectId) => {
  const [exporting, setExporting] = useState(false);

  const exportProject = async (format = 'csv') => {
    setExporting(true);
    try {
      const accessToken = useAuthStore.getState().accessToken;
      const res = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/projects/${projectId}/export?format=${format}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `project_export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return { exportProject, exporting };
};