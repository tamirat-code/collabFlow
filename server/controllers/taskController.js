import Task from '../models/Task.js';
import { getIO } from '../socket.js';

// @POST /api/workspaces/:workspaceId/projects/:projectId/tasks
export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;

  const lastTask = await Task.findOne({ project: req.params.projectId, status: status || 'todo' })
    .sort('-order');
  const order = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    title, description, status: status || 'todo', priority, dueDate, assignee,
    project: req.params.projectId,
    createdBy: req.user.id,
    order,
  });

  const populated = await task.populate('assignee', 'name email avatar');

  getIO().to(`project:${req.params.projectId}`).emit('task:created', populated);

  res.status(201).json(populated);
};

// @GET /api/workspaces/:workspaceId/projects/:projectId/tasks
export const getTasks = async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort('order');

  res.json(tasks);
};

// @PUT /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
export const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { returnDocument: 'after'})
    .populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ message: 'Task not found' });

  getIO().to(`project:${task.project}`).emit('task:updated', task);

  res.json(task);
};

// @PUT /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/move
export const moveTask = async (req, res) => {
  const { status, order } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.taskId,
    { status, order },
    { returnDocument: 'after' }
  ).populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ message: 'Task not found' });

  getIO().to(`project:${task.project}`).emit('task:moved', task);

  res.json(task);
};

// @DELETE /api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId
export const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  getIO().to(`project:${task.project}`).emit('task:deleted', { _id: task._id, project: task.project });

  res.json({ message: 'Task deleted' });
};