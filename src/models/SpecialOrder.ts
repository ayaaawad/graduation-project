import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const SpecialOrderSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    brand: { type: String, required: true, trim: true },
    modelName: { type: String, required: true, trim: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, default: 'new', trim: true },
  },
  {
    timestamps: true,
  }
);

export type SpecialOrderDocument = InferSchemaType<typeof SpecialOrderSchema>;

const SpecialOrder: Model<SpecialOrderDocument> =
  mongoose.models.SpecialOrder ??
  mongoose.model<SpecialOrderDocument>('SpecialOrder', SpecialOrderSchema);

export default SpecialOrder;
