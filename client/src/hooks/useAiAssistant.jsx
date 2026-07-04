import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';

export const useConversation = (workspaceId) => {
  return useQuery({
    queryKey: ['ai-conversation', workspaceId],
    queryFn: () => fetchClient(`/ai-assistant/${workspaceId}/conversation`),
    enabled: !!workspaceId,
  });
};

export const useSendMessage = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) =>
      fetchClient(`/ai-assistant/${workspaceId}/message`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation', workspaceId] });
      data.actions?.forEach((a) => {
        if (a.projectId) {
          queryClient.invalidateQueries({ queryKey: ['tasks', a.projectId] });
        }
      });
    },
  });
};

export const useClearConversation = (workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchClient(`/ai-assistant/${workspaceId}/conversation`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-conversation', workspaceId] }),
  });
};