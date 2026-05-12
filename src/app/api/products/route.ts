import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/models/Product";
import { seedProducts } from "@/data/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const productsRaw = await Product.find({}).sort({ brand: 1, modelName: 1 }).lean();
    const products = productsRaw.map((product) => ({
      ...product,
      _id: product._id?.toString() ?? "",
    }));

    return NextResponse.json(products, { status: 200 });
  } catch {
    return NextResponse.json(seedProducts, { status: 200 });
  }
}