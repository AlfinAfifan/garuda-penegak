import { Schema, model, models } from 'mongoose';

const tkkSchema = new Schema(
  {
    member_id: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    type_tkk_id: {
      type: Schema.Types.ObjectId,
      ref: 'TypeTkk',
      required: true,
    },
    sk_purwa: {
      type: String,
    },
    sk_madya: {
      type: String,
    },
    sk_utama: {
      type: String,
    },
    purwa: {
      type: Boolean,
      default: false,
    },
    madya: {
      type: Boolean,
      default: false,
    },
    utama: {
      type: Boolean,
      default: false,
    },
    date_purwa: {
      type: Date,
      default: null,
    },
    date_madya: {
      type: Date,
      default: null,
    },
    date_utama: {
      type: Date,
      default: null,
    },
    examiner_name_purwa: {
      type: String,
    },
    examiner_position_purwa: {
      type: String,
    },
    examiner_address_purwa: {
      type: String,
    },
    examiner_name_madya: {
      type: String,
    },
    examiner_position_madya: {
      type: String,
    },
    examiner_address_madya: {
      type: String,
    },
    examiner_name_utama: {
      type: String,
    },
    examiner_position_utama: {
      type: String,
    },
    examiner_address_utama: {
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

const Tkk = models.Tkk || model('Tkk', tkkSchema);

export default Tkk;
