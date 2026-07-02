import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { notify } from '../utils/Notify.js';
import { tasksToCSV, tasksToJSON } from '../utils/csvConverter.js';
import Activity from '../models/Activity.js';

export const createProject = async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    workspace: req.params.workspaceId,
    createdBy: req.user.id,
  });

 
  const workspace = req.workspace;
  if (workspace) {
    const recipients = workspace.members
      .map((m) => m.user.toString())
      .filter((uid) => uid !== req.user.id);

    recipients.forEach((recipientId) => {
      notify({
        recipientId,
        senderId:   req.user.id,
        type:       'project_created',
        projectId:  project._id,
        workspaceId: workspace._id,
        message:    `A new project "${name}" was created`,
      }).catch(console.error);
    });
  }

  res.status(201).json(project);
};


export const getProjects = async (req, res) => {
  const projects = await Project.find({ workspace: req.params.workspaceId })
    .populate('createdBy', 'name email avatar')
    .sort('-createdAt');

  res.json(projects);
};


export const getProject = async (req, res) => {
  const project = await Project.findById(req.params.projectId)
    .populate('createdBy', 'name email avatar');

  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};

export const updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.projectId, req.body, { returnDocument: 'after' });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};


export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: 'Project deleted' });
};
export const getAnalytics = async (req, res) => {
  const { workspaceId } = req.params;

  const projects = await Project.find({ workspace: workspaceId });
  const projectIds = projects.map((p) => p._id);

  const tasks = await Task.find({ project: { $in: projectIds } })
    .populate('assignee', 'name avatar')
    .populate('project', 'name');

  const byStatus = {
    todo:        tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  };

  const byPriority = {
    low:    tasks.filter(t => t.priority === 'low').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    high:   tasks.filter(t => t.priority === 'high').length,
  };

  const byProject = projects.map((p) => ({
    name:  p.name,
    total: tasks.filter(t => t.project._id.toString() === p._id.toString()).length,
    done:  tasks.filter(t => t.project._id.toString() === p._id.toString() && t.status === 'done').length,
  }));

  
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const createdPerDay = days.map((day) => {
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = tasks.filter((t) => {
      const created = new Date(t.createdAt);
      return (
        created.getFullYear() === day.getFullYear() &&
        created.getMonth()    === day.getMonth() &&
        created.getDate()     === day.getDate()
      );
    }).length;
    return { label, count };
  });

  
  const assigneeCounts = {};
  tasks.forEach((t) => {
    if (!t.assignee) return;
    const key = t.assignee._id.toString();
    if (!assigneeCounts[key]) {
      assigneeCounts[key] = { name: t.assignee.name, avatar: t.assignee.avatar, count: 0 };
    }
    assigneeCounts[key].count++;
  });
  const topAssignees = Object.values(assigneeCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const overdue = tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  ).length;


  const completionRate = tasks.length
    ? Math.round((byStatus.done / tasks.length) * 100)
    : 0;

  res.json({
    totals: {
      projects: projects.length,
      tasks:    tasks.length,
      overdue,
      completionRate,
    },
    byStatus,
    byPriority,
    byProject,
    createdPerDay,
    topAssignees,
  });
};


export const exportProject = async (req, res) => {
  const { projectId } = req.params;
  const format = req.query.format || 'csv';

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const tasks = await Task.find({ project: projectId })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .sort('status');

  const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  const filename = `${safeName}_${date}`;

  if (format === 'json') {
    const data = tasksToJSON(tasks);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.json(data);
  }


  const csv = tasksToCSV(tasks);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  return res.send(csv);
};
// server/controllers/projectController.js
export const getProjectTimeline = async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ project: projectId }).select('_id title createdAt');
  const taskIds = tasks.map(t => t._id);

  const activities = await Activity.find({ task: { $in: taskIds } })
    .sort('createdAt')
    .populate('user', 'name');

  // Build initial snapshot (tasks in their created state)
  const taskMap = {};
  tasks.forEach(t => {
    taskMap[t._id] = { _id: t._id, title: t.title, status: 'todo', order: 0 };
  });

  // Build a sequence of events with resulting board state
  const events = [];
  const workingState = { ...taskMap };

  for (const act of activities) {
    if (act.type === 'created') {
      workingState[act.task] = { ...workingState[act.task], status: 'todo' };
    }
    if (act.type === 'status_changed' && workingState[act.task]) {
      workingState[act.task] = { ...workingState[act.task], status: act.meta.to };
    }
    if (act.type === 'task_deleted') {
      delete workingState[act.task];
    }

    events.push({
      timestamp: act.createdAt,
      type: act.type,
      user: act.user?.name,
      taskTitle: workingState[act.task]?.title || act.meta?.title || 'a task',
      snapshot: Object.values(workingState).map(t => ({ ...t })),
    });
  }

  res.json({
    initialState: Object.values(taskMap).map(t => ({ ...t, status: 'todo' })),
    events,
  });
};