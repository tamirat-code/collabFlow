import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from '../api/fetchClient';
import { connectSocket } from '../lib/socket';
import useToastStore from '../store/toastStore';

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchClient('/notifications'),
    staleTime: 0,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => fetchClient('/notifications/unread'),
    refetchInterval: 30_000,
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetchClient(`/notifications/${id}/read`, { method: 'PUT' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetchClient('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useNotificationSocket = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore.getState().addToast;

  useEffect(() => {
    const socket = connectSocket();

    const handleNew = (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      addToast(`${notification.sender?.name || 'Someone'} ${notification.message}`);
    };

    socket.on('notification:new', handleNew);

    return () => {
      socket.off('notification:new', handleNew);
    };
  }, [queryClient]);
};

