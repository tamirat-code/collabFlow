import AIConversation from '../models/AiConversation.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Workspace from '../models/Workspace.js';
import { chatWithAssistant } from '../utils/aiService.js';
import { getIO } from '../socket.js';

const ACTION_REGEX = /<action>([\s\S]*?)<\/action>/;

const buildWorkspaceContext = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId).select('name');
  const projects = await Project.find({ workspace: workspaceId }).select('_id name description');

  const projectsWithTasks = await Promise.all(
    projects.map(async (p) => {
      const tasks = await Task.find({ project: p._id })
        .select('title status priority dueDate')
        .limit(30);
      return {
        projectId: p._id,
        projectName: p.name,
        description: p.description,
        taskCount: tasks.length,
        tasks: tasks.map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          overdue: t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
        })),
      };
    })
  );

  return {
    workspaceName: workspace?.name,
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

    const history = convo.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));

    

    const rawReply = await chatWithAssistant({ messages: history, context });

    

    const actionMatch = rawReply.match(ACTION_REGEX);
    let actions = [];
    let cleanReply = rawReply;

    if (actionMatch) {
      cleanReply = rawReply.replace(ACTION_REGEX, '').trim();
      try {
        const actionData = JSON.parse(actionMatch[1].trim());

        if (actionData.type === 'create_tasks') {
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
              createdBy: req.user.id,
              order: order++,
            });
            created.push(task);

            await Activity.create({
              task: task._id,
              project: projectId,
              user: req.user.id,
              type: 'created',
              meta: { title: task.title, source: 'ai_assistant' },
            });
          }

          const populated = await Task.find({ _id: { $in: created.map(t => t._id) } })
            .populate('assignee', 'name email avatar');

          populated.forEach(task => {
            getIO().to(`project:${projectId}`).emit('task:created', task);
          });

          actions.push({ type: 'create_tasks', count: created.length, projectId });
        }
      } catch (err) {
        console.error('Failed to parse/apply AI action:', err.message);
      }
    }

    convo.messages.push({ role: 'assistant', content: cleanReply, actions });
    await convo.save();

    res.json({
      reply: cleanReply,
      actions,
      conversationId: convo._id,
    });
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