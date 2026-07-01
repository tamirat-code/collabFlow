import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

const taskPresence = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = decoded.id.toString(); 
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

  io.on('connection', (socket) => {
    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
    });
    socket.on('leaveProject', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

   
    socket.on('task:viewing', ({ taskId, projectId, name, avatar }) => {
      socket.join(`task:${taskId}`);
      socket.data.currentTaskId = taskId;

      if (!taskPresence.has(taskId)) taskPresence.set(taskId, new Map());
      taskPresence.get(taskId).set(socket.userId, { name, avatar, socketId: socket.id });

      const viewers = Array.from(taskPresence.get(taskId).entries())
        .filter(([uid]) => uid !== socket.userId)
        .map(([uid, v]) => ({ userId: uid, name: v.name, avatar: v.avatar }));

      io.to(`project:${projectId}`).emit('task:presence', { taskId, viewers: getViewers(taskId) });
    });

    socket.on('task:stoppedViewing', ({ taskId, projectId }) => {
      leaveTask(socket, taskId);
      io.to(`project:${projectId}`).emit('task:presence', { taskId, viewers: getViewers(taskId) });
    });

    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      const taskId = socket.data.currentTaskId;
      if (taskId) {
        leaveTask(socket, taskId);
        io.emit('task:presence', { taskId, viewers: getViewers(taskId) });
      }
    });
  });

  function leaveTask(socket, taskId) {
    socket.leave(`task:${taskId}`);
    taskPresence.get(taskId)?.delete(socket.userId);
    if (taskPresence.get(taskId)?.size === 0) taskPresence.delete(taskId);
  }

 function getViewers(taskId) {
  if (!taskPresence.has(taskId)) return [];
  return Array.from(taskPresence.get(taskId).entries())
    .map(([uid, v]) => ({
      userId: uid.toString(), 
      name: v.name,
      avatar: v.avatar,
    }));
}

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};