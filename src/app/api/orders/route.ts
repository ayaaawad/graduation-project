import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

type OrderRequest = {
  productId?: string;
  price?: number;
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  paymentMethod?: "card" | "cash";
  cardName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  isGuest?: boolean;
  userId?: string;
};

export async function POST(request: Request) {
  let body: OrderRequest | null = null;

  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  if (!body?.productId || !body?.name || !body?.address || !body?.phone || !body?.paymentMethod || !body?.email) {
    return NextResponse.json({ error: "Missing order details" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const product = await Product.findById(body.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const order = await Order.create({
      productId: product._id.toString(),
      productBrand: product.brand,
      productModelName: product.modelName,
      price: product.price,
      customerName: body.name,
      customerEmail: body.email,
      customerAddress: body.address,
      customerPhone: body.phone,
      paymentMethod: body.paymentMethod,
      cardName: body.paymentMethod === "card" ? body.cardName : undefined,
      cardNumberLast4:
        body.paymentMethod === "card" && body.cardNumber
          ? body.cardNumber.replace(/\D/g, "").slice(-4)
          : undefined,
      isGuest: body.isGuest !== false,
      userId: body.userId || undefined,
    });

    (product as any).sales_count = ((product as any).sales_count ?? 0) + 1;
    if (typeof product.stock === "number" && product.stock > 0) {
      product.stock -= 1;
    }
    await product.save();

    return NextResponse.json(
      {
        orderId: order._id.toString(),
        product: {
          brand: order.productBrand,
          modelName: order.productModelName,
          price: order.price,
        },
        paymentMethod: order.paymentMethod,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}