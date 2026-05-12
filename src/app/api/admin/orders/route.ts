import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { verifyAdminRole } from "@/lib/adminAuth";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdminRole("manager");
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        orders: orders.map((order) => ({
          ...order,
          _id: order._id.toString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}