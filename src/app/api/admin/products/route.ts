import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/models/Product";
import { verifyAdminRole } from "@/lib/adminAuth";

// GET all products for admin
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRole("manager");
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectToDatabase();
    const products = await Product.find({}).lean();

    return NextResponse.json({
      ok: true,
      count: products.length,
      products: products.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRole("admin");
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      brand,
      modelName,
      category,
      price,
      stock,
      condition,
      display,
      storage,
      ram,
      processor,
      battery,
      gpu,
      aiFeatures,
      image,
      images,
    } = body;

    // Validate required fields
    if (
      !brand ||
      !modelName ||
      !category ||
      !price ||
      !stock ||
      !condition ||
      !display ||
      !storage ||
      !ram ||
      !processor ||
      !battery ||
      !gpu ||
      !aiFeatures
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const filteredImages = images && images.length > 0 ? images.filter((img: string) => img && img.trim() !== '') : [];
    const mainImage = image || (filteredImages.length > 0 ? filteredImages[0] : '');

    const product = await Product.create({
      brand,
      modelName,
      category,
      price,
      stock,
      condition,
      display,
      storage,
      ram,
      processor,
      battery,
      gpu,
      aiFeatures,
      image: mainImage,
      images: filteredImages,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Product created successfully",
        product: {
          ...product.toObject(),
          _id: product._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
