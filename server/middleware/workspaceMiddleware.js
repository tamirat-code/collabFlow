import Workspace from '../models/Workspace.js';

export const checkWorkspaceAccess = async (req, res, next) => {
  const { workspaceId } = req.params;

  const workspace = await Workspace.findById(workspaceId)
    .populate('owner', '_id'); // ← populate owner so _id is accessible

  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

  const ownerId = workspace.owner._id
    ? workspace.owner._id.toString()
    : workspace.owner.toString();

  const isOwner = ownerId === req.user.id.toString();

  const member = workspace.members.find(
    (m) => m.user.toString() === req.user.id.toString()
  );

  if (!isOwner && !member) {
    return res.status(403).json({ message: 'Access denied to this workspace' });
  }

  req.workspace = workspace;
  req.workspaceRole = isOwner ? 'admin' : member.role;
  next();
};

export const requireWorkspaceRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.workspaceRole)) {
    return res.status(403).json({ message: 'Insufficient permissions in this workspace' });
  }
  next();
};