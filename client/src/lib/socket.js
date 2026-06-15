import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io('http://localhost:5000', {
    auth: { token },
    autoConnect: false,
  });

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.auth.token = useAuthStore.getState().accessToken;
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};