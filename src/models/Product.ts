import mongoose, { type InferSchemaType, type Model } from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    modelName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Used"],
    },
    display: {
      screenSize: { type: Number, required: true, min: 0 },
      resolution: { type: String, required: true, trim: true },
      isTouchScreen: { type: Boolean, required: true },
    },
    storage: {
      capacity: { type: String, required: true, trim: true },
      type: { type: String, required: true, trim: true },
    },
    ram: {
      size: { type: String, required: true, trim: true },
    },
    processor: {
      modelName: { type: String, required: true, trim: true },
    },
    battery: {
      capacity: { type: String, required: true, trim: true },
      estimatedRuntimeHours: { type: Number, required: true, min: 0 },
    },
    gpu: {
      modelName: { type: String, required: true, trim: true },
      vram: { type: String, required: true, trim: true },
    },
    aiFeatures: {
      performance: { type: Number, required: true, min: 1, max: 10 },
      portability: { type: Number, required: true, min: 1, max: 10 },
      batteryEfficiency: { type: Number, required: true, min: 1, max: 10 },
    },
    sales_count: { type: Number, required: false, default: 0, min: 0 },
    image: { type: String, required: false, default: '' },
    images: { type: [String], required: false, default: [] },
  },
  {
    timestamps: true,
  }
);

export type ProductDocument = InferSchemaType<typeof ProductSchema>;

const Product: Model<ProductDocument> =
  mongoose.models.Product ?? mongoose.model<ProductDocument>("Product", ProductSchema);

export default Product;