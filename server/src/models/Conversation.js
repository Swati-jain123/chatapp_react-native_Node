import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  }
}, { timestamps: true });
schema.index({ participants: 1 }, { unique: false });
export default mongoose.model('Conversation', schema);
