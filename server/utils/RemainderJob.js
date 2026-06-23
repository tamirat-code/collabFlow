import cron from 'node-cron';
import Task from '../models/Task.js';
import { notify } from './Notify.js';

export const startReminderJob = () => {
  
  cron.schedule('0 * * * *', async () => {
    try {
      const now    = new Date();
      const in24h  = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      
      const tasks = await Task.find({
        dueDate:      { $gte: now, $lte: in24h },
        reminderSent: false,
        status:       { $ne: 'done' },
        assignee:     { $exists: true, $ne: null },
      }).populate('project', 'name workspace');

      for (const task of tasks) {
        await notify({
          recipientId: task.assignee,
          senderId:    task.assignee, 
          type:        'due_date_reminder',
          taskId:      task._id,
          projectId:   task.project?._id,
          workspaceId: task.project?.workspace,
          message:     `Task "${task.title}" is due in less than 24 hours`,
        }).catch(console.error);

        task.reminderSent = true;
        await task.save();
      }


    } catch (err) {
      console.error('[reminderJob] Error:', err.message);
    }
  });

};