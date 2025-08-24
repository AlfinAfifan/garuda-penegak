import { Schema, model, models } from 'mongoose';

const garudaSchema = new Schema(
  {
    member_id: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
    level_tku: {
      type: String,
      required: true,
    },
    total_purwa: {
      type: String,
    },
    total_madya: {
      type: String,
    },
    total_utama: {
      type: String,
    },
    status: {
      type: Number,
      enum: [0, 1], // 0: pending, 1: approved
      default: 0,
    },
    approved_by: {
      type: String,
      default: null,
    },
    is_delete: {
      type: Number, // 0: not deleted, 1: deleted
      enum: [0, 1], 
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Garuda = models.Garuda || model('Garuda', garudaSchema);

export default Garuda;
