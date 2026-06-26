import { useMutation } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

const base = (workspaceId, projectId, taskId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/ai`;

export const useTaskSummary = (workspaceId, projectId, taskId) =>
  useMutation({
    mutationFn: () => fetchClient(`${base(workspaceId, projectId, taskId)}/summary`),
  });

export const useSubtaskSuggestions = (workspaceId, projectId, taskId) =>
  useMutation({
    mutationFn: () => fetchClient(`${base(workspaceId, projectId, taskId)}/subtasks`),
  });

export const usePrioritySuggestion = (workspaceId, projectId, taskId) =>
  useMutation({
    mutationFn: () => fetchClient(`${base(workspaceId, projectId, taskId)}/priority`),
  });