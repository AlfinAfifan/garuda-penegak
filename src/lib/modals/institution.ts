import { Schema, model, models } from 'mongoose';

const institutionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sub_district: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gudep_man: {
      type: String,
    },
    gudep_woman: {
      type: String,
    },
    head_gudep_man: {
      type: String,
    },
    head_gudep_woman: {
      type: String,
    },
    nta_head_gudep_man: {
      type: String,
    },
    nta_head_gudep_woman: {
      type: String,
    },
    headmaster_name: {
      type: String,
    },
    headmaster_number: {
      type: String,
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

const Institution = models.Institution || model('Institution', institutionSchema);

export default Institution;
