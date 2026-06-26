import Attachment from '../models/Attachment.js';
import Activity from '../models/Activity.js';
import Task from '../models/Task.js';
import { cloudinary, getResourceType, uploadToCloudinaryBuffer } from '../config/Cloudinary.js';
import { fixFilename } from '../utils/fixFilename.js';
import { getIO } from '../socket.js';

export const getAttachments = async (req, res) => {
  const attachments = await Attachment.find({ task: req.params.taskId })
    .populate('uploadedBy', 'name email avatar')
    .sort('-createdAt');
  res.json(attachments);
};

export const uploadAttachment = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const resourceType = getResourceType(req.file.mimetype);
  const result = await uploadToCloudinaryBuffer(req.file.buffer, {
    folder:        'collabflow/tasks',
    resource_type: resourceType,
    public_id:     `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });

  const attachment = await Attachment.create({
    task:         req.params.taskId,
    uploadedBy:   req.user.id,
    name:         fixFilename(req.file.originalname),
    url:          result.secure_url,
    publicId:     result.public_id,
    resourceType,
    mimeType:     req.file.mimetype,
    size:         req.file.size,
  });

  const populated = await attachment.populate('uploadedBy', 'name email avatar');

  await Activity.create({
    task:    task._id,
    project: task.project,
    user:    req.user.id,
    type:    'file_attached',
    meta:    { name: fixFilename(req.file.originalname) },
  });

  getIO().to(`project:${task.project}`).emit('attachment:added', {
    taskId: task._id,
    attachment: populated,
  });

  res.status(201).json(populated);
};

export const deleteAttachment = async (req, res) => {
  const attachment = await Attachment.findById(req.params.attachmentId);
  if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

  if (attachment.uploadedBy.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your attachment' });

  
  const resourceType = attachment.resourceType || 'raw';
  await cloudinary.uploader.destroy(attachment.publicId, { resource_type: resourceType });

  await attachment.deleteOne();
  res.json({ message: 'Deleted' });
};