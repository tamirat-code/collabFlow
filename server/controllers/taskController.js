import Task from '../models/Task.js';


export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;

  
  const lastTask = await Task.findOne({ project: req.params.projectId, status: status || 'todo' })
    .sort('-order');
  const order = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority,
    dueDate,
    assignee,
    project: req.params.projectId,
    createdBy: req.user.id,
    order,
  });

  const populated = await task.populate('assignee', 'name email avatar');
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
  const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true })
    .populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};


export const moveTask = async (req, res) => {
  const { status, order } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.taskId,
    { status, order },
    { new: true }
  ).populate('assignee', 'name email avatar');

  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
};


export const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
};