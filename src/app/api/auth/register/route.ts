import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
    });

    // Create response with cookies
    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
        },
      },
      { status: 201 }
    );

    // Set non-httpOnly cookies for client access
    response.cookies.set("user_email", user.email, { maxAge: 7 * 24 * 60 * 60 });
    response.cookies.set("user_name", user.fullName, { maxAge: 7 * 24 * 60 * 60 });
    response.cookies.set("user_id", user._id.toString(), { maxAge: 7 * 24 * 60 * 60 });
    response.cookies.set("is_logged_in", "true", { maxAge: 7 * 24 * 60 * 60 });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
