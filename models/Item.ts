import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  userId: string;
  dateAcquired?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const itemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true },
    description: String,
    userId: { type: String, required: true, index: true },
    dateAcquired: { type: Date },
  },
  { timestamps: true }
);

// Clear model cache in development to ensure schema changes are picked up
if (process.env.NODE_ENV !== 'production' && mongoose.models.Item) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (mongoose.models as any).Item;
}

const Item = mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);
export default Item;