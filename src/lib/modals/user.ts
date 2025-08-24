import { Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },
    institution_id: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },
    access_token: {
      type: String,
      default: null,
    },
    refresh_token: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      enum: [0, 1], // 0: pending, 1: approved
      default: 1,
    },
    is_delete: {
      type: Number, // 0: not deleted, 1: deleted
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const User = models.User || model('User', userSchema);

export default User;
