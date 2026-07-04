import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  actions: [{ type: mongoose.Schema.Types.Mixed }], // tasks created, etc. for UI display
}, { timestamps: true });

const aiConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('AIConversation', aiConversationSchema);