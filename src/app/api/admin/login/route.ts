import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Admin from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find admin by email
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password (in production, use proper hashing like bcrypt)
    if (admin.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create response with cookies
    const res = NextResponse.json({
      ok: true,
      message: "Login successful",
      role: admin.role,
    });

    res.cookies.set("admin_email", admin.email, {
      httpOnly: false,
      sameSite: 'lax',
      path: "/",
      maxAge: 3600,
    });
    res.cookies.set("admin_role", admin.role, {
      httpOnly: false,
      sameSite: 'lax',
      path: "/",
      maxAge: 3600,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
