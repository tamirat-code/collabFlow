import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import Task from '../models/Task.js';
import { getIO } from '../socket.js';
import { notify } from '../utils/Notify.js';

export const getComments = async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('author', 'name email avatar')
    .sort('createdAt');
  res.json(comments);
};

export const addComment = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });

  const task = await Task.findById(req.params.taskId).populate('createdBy assignee');
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const comment = await Comment.create({
    task: req.params.taskId,
    author: req.user.id,
    content: content.trim(),
  });

  const populated = await comment.populate('author', 'name email avatar');


  await Activity.create({
    task: task._id,
    project: task.project,
    user: req.user.id,
    type: 'commented',
    meta: { preview: content.slice(0, 80) },
  });

  getIO().to(`project:${task.project}`).emit('comment:added', {
    taskId: task._id,
    comment: populated,
  });

 
  const recipients = new Set();
  if (task.createdBy?._id) recipients.add(task.createdBy._id.toString());
  if (task.assignee?._id)  recipients.add(task.assignee._id.toString());

  for (const recipientId of recipients) {
    await notify({
      recipientId,
      senderId:    req.user.id,
      type:        'comment',
      taskId:      task._id,
      projectId:   task.project,
      workspaceId: req.workspace?._id,
      message:     `commented on "${task.title}"`,
    });
  }

  res.status(201).json(populated);
};

export const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.author.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your comment' });

  await comment.deleteOne();
  res.json({ message: 'Deleted' });
};

export const getActivity = async (req, res) => {
  const activity = await Activity.find({ task: req.params.taskId })
    .populate('user', 'name email avatar')
    .sort('-createdAt')
    .limit(50);
  res.json(activity);
};