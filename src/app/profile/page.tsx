"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  _id: string;
  productBrand: string;
  productModelName: string;
  price: number;
  status: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const name = typeof document !== "undefined" 
      ? new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("name") || "User"
      : "User";
    
    const email = typeof document !== "undefined"
      ? (document.cookie.split("; ").find(row => row.startsWith("user_email="))?.split("=")[1] || "")
      : "";

    if (!email) {
      router.push("/");
      return;
    }

    setUserName(name);
    setUserEmail(email);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/user/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      document.cookie = "user_email=; max-age=0";
      document.cookie = "user_name=; max-age=0";
      document.cookie = "user_id=; max-age=0";
      document.cookie = "is_logged_in=; max-age=0";
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-8 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">My Profile</h1>
            <p className="mt-2 text-slate-400">Welcome back, <span className="font-semibold text-white">{userName}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="mb-8 grid gap-4 rounded-lg border border-white/10 bg-white/5 p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="mt-1 font-semibold text-white">{userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Account Status</p>
            <p className="mt-1 font-semibold text-emerald-400">Active</p>
          </div>
        </div>

        {/* Order History */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-white">Order History</h2>

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-slate-300">Loading your orders...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-slate-300">No orders yet.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {!isLoading && orders.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Laptop</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-white/10 transition hover:bg-white/5">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {order.productBrand} {order.productModelName}
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-400">
                        ${order.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/"
            className="flex-1 rounded-lg border border-white/10 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/5"
          >
            Back to Store
          </Link>
          <Link
            href="/admin/manage"
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            Manage Inventory
          </Link>
        </div>
      </section>
    </div>
  );
}
