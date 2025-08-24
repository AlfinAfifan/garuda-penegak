import mongoose, { Schema } from 'mongoose';

const activityLogSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true }, // contoh: 'create', 'update', 'delete', 'login'
  description: { type: String, required: true },
  module: { type: String }, // contoh: 'Member', 'Institution'
  createdAt: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
