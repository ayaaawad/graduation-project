import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value;
    const userEmail = request.cookies.get("user_email")?.value;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const orders = await Order.find({
      $or: [
        { userId: userId },
        { customerEmail: userEmail, isGuest: false }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
