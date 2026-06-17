import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { getIO } from '../socket.js';

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

  await Activity.create({
    task: task._id,
    project: req.params.projectId,
    user: req.user.id,
    type: 'created',
    meta: { title },
  });

  getIO().to(`project:${req.params.projectId}`).emit('task:created', populated);
  res.status(201).json(populated);
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort('order');
  res.json(tasks);
};

export const updateTask = async (req, res) => {
  const old = await Task.findById(req.params.taskId);
  if (!old) return res.status(404).json({ message: 'Task not found' });

  const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { returnDocument: 'after' })
    .populate('assignee', 'name email avatar');

  const activities = [];
  if (req.body.status && req.body.status !== old.status)
    activities.push({ type: 'status_changed', meta: { from: old.status, to: req.body.status } });
  if (req.body.priority && req.body.priority !== old.priority)
    activities.push({ type: 'priority_changed', meta: { from: old.priority, to: req.body.priority } });
  if (req.body.assignee && req.body.assignee !== old.assignee?.toString())
    activities.push({ type: 'assigned', meta: { assignee: req.body.assignee } });
  if (req.body.dueDate && req.body.dueDate !== old.dueDate?.toISOString())
    activities.push({ type: 'due_date_changed', meta: { to: req.body.dueDate } });

  if (activities.length) {
    await Activity.insertMany(activities.map(a => ({
      ...a,
      task: task._id,
      project: task.project,
      user: req.user.id,
    })));
  }

  getIO().to(`project:${task.project}`).emit('task:updated', task);
  res.json(task);
};

export const moveTask = async (req, res) => {
  const { status, order } = req.body;
  const old = await Task.findById(req.params.taskId);

  const task = await Task.findByIdAndUpdate(
    req.params.taskId,
    { status, order },
    { returnDocument: 'after' }
  ).populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (old.status !== status) {
    await Activity.create({
      task: task._id,
      project: task.project,
      user: req.user.id,
      type: 'status_changed',
      meta: { from: old.status, to: status },
    });
  }

  getIO().to(`project:${task.project}`).emit('task:moved', task);
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  getIO().to(`project:${task.project}`).emit('task:deleted', { _id: task._id, project: task.project });
  res.json({ message: 'Task deleted' });
};