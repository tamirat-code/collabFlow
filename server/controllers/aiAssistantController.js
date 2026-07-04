import AIConversation from '../models/AiConversation.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Workspace from '../models/Workspace.js';
import { chatWithAssistant } from '../utils/aiService.js';
import { getIO } from '../socket.js';

const ACTION_REGEX = /<action>([\s\S]*?)<\/action>/;
const buildWorkspaceContext = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId)
    .select('name owner members')
    .populate('owner', '_id name')
    .populate('members.user', '_id name');

  const projects = await Project.find({ workspace: workspaceId }).select('_id name description');

  const projectsWithTasks = await Promise.all(
    projects.map(async (p) => {
      const tasks = await Task.find({ project: p._id })
        .select('_id title status priority dueDate assignee')
        .populate('assignee', '_id name')
        .limit(15);

      return {
        projectId: p._id.toString(),
        projectName: p.name,
        tasks: tasks.map(t => ({
          taskId: t._id.toString(),
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          overdue: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
          assignee: t.assignee ? { userId: t.assignee._id.toString(), name: t.assignee.name } : null,
        })),
      };
    })
  );

  const members = [
    { userId: workspace.owner._id.toString(), name: workspace.owner.name, role: 'admin (owner)' },
    ...workspace.members.map(m => ({
      userId: m.user._id.toString(),
      name: m.user.name,
      role: m.role,
    })),
  ];

  return {
    workspaceName: workspace.name,
    members,
    projects: projectsWithTasks,
  };
};
export const getConversation = async (req, res) => {
  const { workspaceId } = req.params;

  let convo = await AIConversation.findOne({ user: req.user.id, workspace: workspaceId });
  if (!convo) {
    convo = await AIConversation.create({ user: req.user.id, workspace: workspaceId, messages: [] });
  }

  res.json(convo);
};
const statusRank = { todo: 0, 'in-progress': 1, done: 2 };

const applyAction = async (actionData, userId) => {
  switch (actionData.type) {

    case 'create_tasks': {
      const { projectId, tasks } = actionData;
      const lastTask = await Task.findOne({ project: projectId, status: 'todo' }).sort('-order');
      let order = lastTask ? lastTask.order + 1 : 0;

      const created = [];
      for (const t of tasks) {
        const task = await Task.create({
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'medium',
          status: 'todo',
          project: projectId,
          createdBy: userId,
          order: order++,
        });
        created.push(task);
        await Activity.create({
          task: task._id, project: projectId, user: userId,
          type: 'created', meta: { title: task.title, source: 'ai_assistant' },
        });
      }

      const populated = await Task.find({ _id: { $in: created.map(t => t._id) } })
        .populate('assignee', 'name email avatar');
      populated.forEach(task => getIO().to(`project:${projectId}`).emit('task:created', task));

      return { type: 'create_tasks', count: created.length, projectId };
    }

    case 'move_task': {
      const { taskId, status, reason } = actionData;
      const task = await Task.findById(taskId);
      if (!task) throw new Error('Task not found');

      const isRegression = statusRank[status] < statusRank[task.status];
      if (isRegression && !reason?.trim()) {
        throw new Error('A reason is required to move this task backward');
      }

      const columnTasks = await Task.find({ project: task.project, status }).sort('-order');
      const newOrder = columnTasks.length ? columnTasks[0].order + 1 : 0;

      const oldStatus = task.status;
      task.status = status;
      task.order = newOrder;
      await task.save();

      await Activity.create({
        task: task._id, project: task.project, user: userId,
        type: 'status_changed', meta: { from: oldStatus, to: status },
        reason: isRegression ? reason.trim() : '',
      });

      const populated = await task.populate('assignee', 'name email avatar');
      getIO().to(`project:${task.project}`).emit('task:moved', populated);

      return { type: 'move_task', taskId, from: oldStatus, to: status, title: task.title, projectId: task.project.toString() };
    }

    case 'assign_task': {
      const { taskId, assigneeUserId } = actionData;
      const task = await Task.findById(taskId);
      if (!task) throw new Error('Task not found');

      task.assignee = assigneeUserId;
      await task.save();

      await Activity.create({
        task: task._id, project: task.project, user: userId,
        type: 'assigned', meta: { assigneeUserId },
      });

      const populated = await task.populate('assignee', 'name email avatar');
      getIO().to(`project:${task.project}`).emit('task:updated', populated);

      return { type: 'assign_task', taskId, title: task.title, assigneeName: populated.assignee?.name, projectId: task.project.toString() };
    }

    case 'delete_task': {
      const { taskId, reason } = actionData;
      if (!reason?.trim()) throw new Error('A reason is required to delete a task');

      const task = await Task.findByIdAndDelete(taskId);
      if (!task) throw new Error('Task not found');

      await Activity.create({
        task: task._id, project: task.project, user: userId,
        type: 'task_deleted', meta: { title: task.title }, reason: reason.trim(),
      });

      getIO().to(`project:${task.project}`).emit('task:deleted', { _id: task._id, project: task.project });

      return { type: 'delete_task', title: task.title, projectId: task.project.toString() };
    }

    default:
      throw new Error(`Unknown action type: ${actionData.type}`);
  }
};
export const sendMessage = async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    let convo = await AIConversation.findOne({ user: req.user.id, workspace: workspaceId });
    if (!convo) {
      convo = await AIConversation.create({ user: req.user.id, workspace: workspaceId, messages: [] });
    }

    convo.messages.push({ role: 'user', content: content.trim() });

    const context = await buildWorkspaceContext(workspaceId);
    const history = convo.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    const rawReply = await chatWithAssistant({ messages: history, context });

    const actionMatch = rawReply.match(ACTION_REGEX);
    let actions = [];
    let cleanReply = rawReply;

    if (actionMatch) {
      cleanReply = rawReply.replace(ACTION_REGEX, '').trim();

      try {
        const actionData = JSON.parse(actionMatch[1].trim());
        const result = await applyAction(actionData, req.user.id);
        if (result) actions.push(result);
      } catch (err) {
        console.error('Failed to parse/apply AI action:', err.message);
        cleanReply += `\n\n(I tried to make a change but hit an error: ${err.message})`;
      }
    }

    convo.messages.push({ role: 'assistant', content: cleanReply, actions });
    await convo.save();

    res.json({ reply: cleanReply, actions, conversationId: convo._id });
  } catch (err) {
    console.error('FULL AI ASSISTANT ERROR:', err);
    res.status(500).json({ message: err.message || 'AI assistant failed' });
  }
};

export const clearConversation = async (req, res) => {
  const { workspaceId } = req.params;
  await AIConversation.findOneAndUpdate(
    { user: req.user.id, workspace: workspaceId },
    { messages: [] }
  );
  res.json({ message: 'Conversation cleared' });
};