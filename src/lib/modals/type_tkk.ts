import { Schema, model, models } from 'mongoose';

const typeTkkSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sector: {
      type: String,
    },
    color: {
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

const TypeTkk = models.TypeTkk || model('TypeTkk', typeTkkSchema);

export default TypeTkk;
