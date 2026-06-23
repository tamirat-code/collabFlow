import Notification from '../models/Notification.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';
import { sendEmail } from './sendEmail.js';
import { notificationTemplate, workspaceInviteTemplate } from './emailTemplates.js';

export const notify = async ({
  recipientId,
  senderId,
  type,
  taskId,
  projectId,
  workspaceId,
  message,
  emailAlways = false,
  emailHtml,
  emailSubject,
}) => {
  if (!recipientId || recipientId.toString() === senderId.toString()) return;

  const notification = await Notification.create({
    recipient: recipientId,
    sender:    senderId,
    type,
    task:      taskId,
    project:   projectId,
    workspace: type === 'invite' ? workspaceId : undefined,
    message,
  });

  const populated = await notification.populate([
    { path: 'sender',    select: 'name avatar' },
    { path: 'task',      select: 'title' },
    { path: 'project',   select: 'name' },
    { path: 'workspace', select: 'name' },
  ]);

  getIO().to(`user:${recipientId}`).emit('notification:new', populated);

  try {
    const workspace = workspaceId ? await Workspace.findById(workspaceId) : null;
    const shouldEmail = emailAlways || (workspace && ['pro', 'business'].includes(workspace.plan));

    if (shouldEmail) {
      const recipient = await User.findById(recipientId).select('email');
      if (recipient?.email) {
        await sendEmail({
          to: recipient.email,
          subject: emailSubject ?? `CollabFlow: ${message}`,
          html: emailHtml ?? notificationTemplate(
            populated.sender.name,
            message,
            populated.task?.title
          ),
        });
      }
    }
  } catch (err) {
    console.error('Notification email failed:', err.message);
  }

  return populated;
};

export const notifyWorkspaceInvite = async ({ recipientId, senderId, workspaceId, workspaceName, role }) => {
  const inviter = await User.findById(senderId).select('name');
  const inviterName = inviter?.name || 'Someone';

  return notify({
    recipientId,
    senderId,
    type:        'invite',
    workspaceId,
    message:     `invited you to join "${workspaceName}" as ${role}`,
    emailAlways: true,
    emailSubject: `CollabFlow: You've been invited to ${workspaceName}`,
    emailHtml: workspaceInviteTemplate(inviterName, workspaceName, role),
  });
};
