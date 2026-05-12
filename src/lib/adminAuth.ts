import { cookies } from "next/headers";
import { connectToDatabase } from "./mongoose";
import Admin from "@/models/Admin";

export async function verifyAdminRole(
  requiredRole: "admin" | "manager" = "admin"
): Promise<{ isValid: boolean; email?: string; role?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const adminEmail = cookieStore.get("admin_email")?.value;
    const adminRole = cookieStore.get("admin_role")?.value;

    if (!adminEmail || !adminRole) {
      return { isValid: false, error: "Not authenticated" };
    }

    // Check if user has required role
    const roleHierarchy = { admin: 2, manager: 1 };
    const userRoleLevel = roleHierarchy[adminRole as "admin" | "manager"] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredLevel) {
      return {
        isValid: false,
        error: `Insufficient permissions. Required role: ${requiredRole}`,
      };
    }

    // Verify admin exists and is active
    await connectToDatabase();
    const admin = await Admin.findOne({
      email: adminEmail,
      isActive: true,
    }).lean();

    if (!admin) {
      return { isValid: false, error: "Admin account not found or inactive" };
    }

    return { isValid: true, email: adminEmail, role: adminRole };
  } catch (error) {
    return {
      isValid: false,
      error: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function setAdminCookies(
  email: string,
  role: "admin" | "manager"
) {
  const cookieStore = await cookies();
  cookieStore.set("admin_email", email, {
    httpOnly: false,
    maxAge: 3600,
    path: "/",
  });
  cookieStore.set("admin_role", role, {
    httpOnly: false,
    maxAge: 3600,
    path: "/",
  });
}

export async function clearAdminCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_email");
  cookieStore.delete("admin_role");
}
