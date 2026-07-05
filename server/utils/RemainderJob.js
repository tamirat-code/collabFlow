import cron from 'node-cron';
import Task from '../models/Task.js';
import { notify } from './Notify.js';

export const startReminderJob = () => {
  // Runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      const now    = new Date();
      const in24h  = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find tasks due within the next 24 hours that haven't had a reminder sent yet
      const tasks = await Task.find({
        dueDate:      { $gte: now, $lte: in24h },
        reminderSent: false,
        status:       { $ne: 'done' },
        assignee:     { $exists: true, $ne: null },
      }).populate('project', 'name workspace')
        .populate('assignee', '_id');

     
      const workspaceIds = [...new Set(tasks.map(t => t.project?.workspace?.toString()).filter(Boolean))];
      const Workspace = (await import('../models/Workspace.js')).default;
      const workspaces = await Workspace.find({ _id: { $in: workspaceIds } }).select('_id owner');
      const ownerMap = Object.fromEntries(workspaces.map(w => [w._id.toString(), w.owner.toString()]));

      for (const task of tasks) {
        const assigneeId   = task.assignee?._id?.toString() ?? task.assignee?.toString();
        const workspaceId  = task.project?.workspace;
        const ownerId      = workspaceId ? ownerMap[workspaceId.toString()] : null;
        const msg          = `Task "${task.title}" is due in less than 24 hours`;

     
        await notify({
          recipientId: assigneeId,
          senderId:    assigneeId,
          type:        'due_date_reminder',
          taskId:      task._id,
          projectId:   task.project?._id,
          workspaceId,
          message:     msg,
        }).catch(() => {});


        if (ownerId && ownerId !== assigneeId) {
          await notify({
            recipientId: ownerId,
            senderId:    assigneeId,
            type:        'due_date_reminder',
            taskId:      task._id,
            projectId:   task.project?._id,
            workspaceId,
            message:     msg,
          }).catch(() => {});
        }

        task.reminderSent = true;
        await task.save();
      }


    } catch {
    e.printStackTrace();
    }
  });

};