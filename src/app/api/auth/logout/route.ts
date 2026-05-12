import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );

  // Clear cookies
  response.cookies.delete("user_email");
  response.cookies.delete("user_name");
  response.cookies.delete("user_id");
  response.cookies.delete("is_logged_in");

  return response;
}
