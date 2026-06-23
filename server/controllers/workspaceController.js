import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { notifyWorkspaceInvite,notify } from '../utils/Notify.js';

export const createWorkspace = async (req, res) => {
  const { name } = req.body;

  const workspace = await Workspace.create({
    name,
    owner: req.user.id,
    members: [],
  });

  await workspace.populate('owner', '_id name email avatar');

  res.status(201).json({
    ...workspace.toObject(),
    myRole: 'admin',
  });
};

export const getMyWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [
      { owner: req.user.id },
      { 'members.user': req.user.id },
    ],
  })
    .populate('owner', '_id name email avatar')
    .populate('members.user', 'name email avatar');

  const result = workspaces.map((ws) => {
    const isOwner = ws.owner._id.toString() === req.user.id;
    const member = ws.members.find((m) => m.user?._id?.toString() === req.user.id);
    return {
      ...ws.toObject(),
      myRole: isOwner ? 'admin' : member?.role || 'viewer',
    };
  });

  res.json(result);
};

export const getWorkspace = async (req, res) => {
  
  const workspace = await Workspace.findById(req.workspace._id)
    .populate('owner', '_id name email avatar')
    .populate('members.user', 'name email avatar');

  if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

  const isOwner = workspace.owner._id.toString() === req.user.id;
  const member = workspace.members.find((m) => m.user?._id?.toString() === req.user.id);

  res.json({
    ...workspace.toObject(),
    myRole: isOwner ? 'admin' : member?.role || 'viewer',
  });
};
export const inviteMember = async (req, res) => {
  const { email, role = 'member' } = req.body;
 
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User with this email not found' });
 
  const alreadyMember = req.workspace.members.some(m => m.user.toString() === user._id.toString());
  if (alreadyMember) return res.status(400).json({ message: 'User already in workspace' });
 
  req.workspace.members.push({ user: user._id, role });
  await req.workspace.save();
 
  notify({
    recipientId: user._id,
    senderId:    req.user.id,
    type:        'member_added',
    workspaceId: req.workspace._id,
    message:     `You were added to workspace "${req.workspace.name}"`,
  }).catch(console.error);
 
 
  const updated = await Workspace.findById(req.workspace._id)
    .populate('owner', '_id name email avatar')
    .populate('members.user', 'name email avatar');
 
  res.json({ message: 'Member added', workspace: updated });
};

export const removeMember = async (req, res) => {
  req.workspace.members = req.workspace.members.filter(
    m => m.user.toString() !== req.params.userId
  );
  await req.workspace.save();
  res.json({ message: 'Member removed' });
};

export const deleteWorkspace = async (req, res) => {
  if (req.workspace.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the owner can delete this workspace' });
  }
  await req.workspace.deleteOne();
  res.json({ message: 'Workspace deleted' });
};