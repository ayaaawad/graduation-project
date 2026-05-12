import mongoose, { type InferSchemaType, type Model } from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    productBrand: { type: String, required: true, trim: true },
    productModelName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    customerName: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, enum: ["card", "cash"] },
    cardName: { type: String, required: false, trim: true },
    cardNumberLast4: { type: String, required: false, trim: true },
    status: { type: String, default: "confirmed", trim: true },
    isGuest: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export type OrderDocument = InferSchemaType<typeof OrderSchema>;

const Order: Model<OrderDocument> =
  mongoose.models.Order ?? mongoose.model<OrderDocument>("Order", OrderSchema);

export default Order;