import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['comment', 'assigned', 'mention', 'invite','member_added','project_created','due_date_reminder'], required: true },
  task:      { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  message:   { type: String, required: true },
  read:      { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);