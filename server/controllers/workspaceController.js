import Workspace from '../models/Workspace.js';
import User from '../models/User.js';


export const createWorkspace = async (req, res) => {
  const { name } = req.body;

  const workspace = await Workspace.create({
    name,
    owner: req.user.id,
    members: [],
  });

  res.status(201).json(workspace);
};


export const getMyWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [
      { owner: req.user.id },
      { 'members.user': req.user.id },
    ],
  }).populate('owner', 'name email avatar');

  res.json(workspaces);
};


export const getWorkspace = async (req, res) => {
  const workspace = await req.workspace.populate('members.user', 'name email avatar');
  res.json(workspace);
};


export const inviteMember = async (req, res) => {
  const { email, role = 'member' } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User with this email not found' });

  const alreadyMember = req.workspace.members.some(m => m.user.toString() === user._id.toString());
  if (alreadyMember) return res.status(400).json({ message: 'User already in workspace' });

  req.workspace.members.push({ user: user._id, role });
  await req.workspace.save();

  res.json({ message: 'Member added', workspace: req.workspace });
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