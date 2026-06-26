import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import { summariseTask, suggestSubtasks, suggestPriority } from '../utils/aiService.js';

export const getTaskSummary = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const [comments, activity] = await Promise.all([
    Comment.find({ task: task._id }).populate('user', 'name').limit(20).sort('-createdAt'),
    Activity.find({ task: task._id }).limit(20).sort('-createdAt'),
  ]);

  const summary = await summariseTask({
    title:       task.title,
    description: task.description,
    comments,
    activity,
  });

  res.json({ summary });
};

export const getSubtaskSuggestions = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const subtasks = await suggestSubtasks({
    title:       task.title,
    description: task.description,
  });

  res.json({ subtasks });
};

export const getPrioritySuggestion = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const result = await suggestPriority({
    title:       task.title,
    description: task.description,
  });

  res.json(result);
};