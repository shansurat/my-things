import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  name: string;
  description: string;
  userId: string;
  dateAcquired?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  image?: Buffer;
  imageContentType?: string;
}

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    description: String,
    userId: { type: String, required: true, index: true },
    dateAcquired: { type: Date },
    image: { type: Buffer },
    imageContentType: { type: String },
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