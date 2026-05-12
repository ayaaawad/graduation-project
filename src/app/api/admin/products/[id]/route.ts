import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/models/Product";
import { verifyAdminRole } from "@/lib/adminAuth";

// PATCH update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRole("admin");
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    let body = await request.json();

    // Update main image field from images array if images are provided
    if (body.images && Array.isArray(body.images)) {
      const filteredImages = body.images.filter((img: string) => img && img.trim() !== '');
      body.images = filteredImages;
      if (!body.image && filteredImages.length > 0) {
        body.image = filteredImages[0];
      }
    }

    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "Product updated successfully",
      product: {
        ...product.toObject(),
        _id: product._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE remove product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminRole("admin");
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: "Product deleted successfully",
      deletedProduct: {
        ...product.toObject(),
        _id: product._id.toString(),
      },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
