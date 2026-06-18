import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  task:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },  
  url:          { type: String, required: true },   
  publicId:     { type: String, required: true },   
  size:         { type: Number },
}, { timestamps: true });

export default mongoose.model('Attachment', attachmentSchema);