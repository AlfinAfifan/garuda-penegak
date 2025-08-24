import { Schema, model, models } from 'mongoose';

const tkuSchema = new Schema(
  {
    member_id: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    bantara: {
      type: Boolean,
      default: false,
    },
    laksana: {
      type: Boolean,
      default: false,
    },
    sk_bantara: {
      type: String,
    },
    sk_laksana: {
      type: String,
    },
    date_bantara: {
      type: Date,
      default: null,
    },
    date_laksana: {
      type: Date,
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

const Tku = models.Tku || model('Tku', tkuSchema);

export default Tku;
