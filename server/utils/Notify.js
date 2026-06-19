import Notification from '../models/Notification.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';
import { sendEmail } from './sendEmail.js';
import { notificationTemplate } from './emailTemplates.js';


export const notify = async ({ recipientId, senderId, type, taskId, projectId, workspaceId, message }) => {
  if (!recipientId || recipientId.toString() === senderId.toString()) return;

  const notification = await Notification.create({
    recipient: recipientId,
    sender:    senderId,
    type,
    task:      taskId,
    project:   projectId,
    message,
  });

  const populated = await notification.populate([
    { path: 'sender',  select: 'name avatar' },
    { path: 'task',    select: 'title' },
    { path: 'project', select: 'name' },
  ]);

  getIO().to(`user:${recipientId}`).emit('notification:new', populated);

  try {
    const workspace = await Workspace.findById(workspaceId);
    if (workspace && ['pro', 'business'].includes(workspace.plan)) {
      const recipient = await User.findById(recipientId).select('email');
      if (recipient?.email) {
        await sendEmail({
          to: recipient.email,
          subject: `CollabFlow: ${message}`,
          html: notificationTemplate(populated.sender.name, message, populated.task?.title),
        });
      }
    }
  } catch (err) {
    console.error('Notification email failed:', err.message);
  }

  return populated;
};