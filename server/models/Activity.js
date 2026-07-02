import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  task:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['created', 'status_changed', 'priority_changed', 'assigned', 'commented', 'due_date_changed', 'file_attached'], required: true },
  meta:    { type: mongoose.Schema.Types.Mixed, default: {} },
  reason:  { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);