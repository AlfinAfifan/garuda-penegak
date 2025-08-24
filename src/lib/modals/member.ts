import { Schema, model, models } from 'mongoose';

const memberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    institution_id: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },
    member_number: { //NTA
      type: String,
    },
    parent_number: { //NO INDUK
      type: String,
    },
    gender: {
      type: String,
      enum: ['Laki-laki', 'Perempuan', 'Lainnya'],
      default: 'Lainnya',
    },
    birth_place: {
      type: String,
    },
    birth_date: {
      type: Date,
    },
    religion: {
      type: String,
    },
    nationality: {
      type: String,
    },
    rt: {
      type: String,
    },
    rw: {
      type: String,
    },
    village: {
      type: String,
    },
    sub_district: {
      type: String,
    },
    district: {
      type: String,
    },
    province: {
      type: String,
    },
    talent: {
      type: String,
    },
    father_name: {
      type: String,
    },
    father_birth_place: {
      type: String,
    },
    father_birth_date: {
      type: Date,
    },
    mother_name: {
      type: String,
    },
    mother_birth_place: {
      type: String,
    },
    mother_birth_date: {
      type: Date,
    },
    parent_address: {
      type: String,
    },
    parent_phone: {
      type: String,
    },
    entry_date: {
      type: Date,
    },
    entry_level: {
      type: String,
    },
    exit_date: {
      type: Date,
    },
    exit_reason: {
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

const Member = models.Member || model('Member', memberSchema);

export default Member;
