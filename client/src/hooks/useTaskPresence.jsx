import { useEffect, useState } from 'react';
import { connectSocket } from '../lib/socket';
import useAuthStore from '../store/authStore';

export const useTaskPresence = (taskId, projectId) => {
  const [viewers, setViewers] = useState([]);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!taskId || !projectId) return;
    const socket = connectSocket();

    socket.emit('task:viewing', {
      taskId, projectId,
      name: user?.name, avatar: user?.avatar,
    });

    const handlePresence = (data) => {
      if (data.taskId === taskId) setViewers(data.viewers);
      
    };

    socket.on('task:presence', handlePresence);

    return () => {
      socket.emit('task:stoppedViewing', { taskId, projectId });
      socket.off('task:presence', handlePresence);
      setViewers([]);
    };
  }, [taskId, projectId]);

  return viewers;
};