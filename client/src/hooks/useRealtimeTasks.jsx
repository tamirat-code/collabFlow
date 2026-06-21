import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '../lib/socket';
import useToastStore from '../store/toastStore';
import useAuthStore from '../store/authStore';

export const useRealtimeTasks = (projectId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    // Read from store inside effect so values are always fresh
    const addToast       = useToastStore.getState().addToast;
    const currentUserId  = useAuthStore.getState().user?.id;

    const socket = connectSocket();
    socket.emit('joinProject', projectId);

    const handleCreated = (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = []) => {
        if (old.some((t) => t._id === task._id)) return old;
        return [...old, task];
      });
      // Only toast if someone else created the task
      const creatorId = task.createdBy?._id ?? task.createdBy;
      if (creatorId && creatorId.toString() !== currentUserId?.toString()) {
        addToast(`New task added: ${task.title}`);
      }
    };

    const handleUpdated = (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = []) =>
        old.map((t) => (t._id === task._id ? task : t))
      );
    };

    const handleMoved = (task) => {
      queryClient.setQueryData(['tasks', projectId], (old = []) =>
        old.map((t) => (t._id === task._id ? task : t))
      );
    };

    const handleDeleted = ({ _id }) => {
      queryClient.setQueryData(['tasks', projectId], (old = []) =>
        old.filter((t) => t._id !== _id)
      );
    };

    socket.on('task:created', handleCreated);
    socket.on('task:updated', handleUpdated);
    socket.on('task:moved',   handleMoved);
    socket.on('task:deleted', handleDeleted);

    return () => {
      socket.emit('leaveProject', projectId);
      socket.off('task:created', handleCreated);
      socket.off('task:updated', handleUpdated);
      socket.off('task:moved',   handleMoved);
      socket.off('task:deleted', handleDeleted);
    };
  }, [projectId, queryClient]);
};