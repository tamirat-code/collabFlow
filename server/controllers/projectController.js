import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { notify } from '../utils/Notify.js';


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