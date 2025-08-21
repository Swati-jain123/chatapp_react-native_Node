import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  status: { type: String, enum: ['sent','delivered','read'], default: 'sent' },
  sentAt: { type: Date, default: () => new Date() },
  deliveredAt: Date,
  readAt: Date
}, { timestamps: true });
schema.index({ conversation: 1, createdAt: -1 });
export default mongoose.model('Message', schema);
