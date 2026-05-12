"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

type CheckoutFormProps = {
  product: {
    _id: string;
    brand: string;
    modelName: string;
    price: number;
  };
  selectedPrice: number;
};

type OrderResponse = {
  orderId: string;
  product: {
    brand: string;
    modelName: string;
    price: number;
  };
  paymentMethod: "card" | "cash";
};

export default function CheckoutForm({ product, selectedPrice }: CheckoutFormProps) {
  const router = useRouter();
  const [checkoutType, setCheckoutType] = useState<"guest" | "user" | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is logged in on mount
  useEffect(() => {
    const isLoggedIn = typeof document !== "undefined" 
      ? document.cookie.includes("is_logged_in=true")
      : false;
    setIsUserLoggedIn(isLoggedIn);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const userId = typeof document !== "undefined"
      ? document.cookie.split("; ").find(row => row.startsWith("user_id="))?.split("=")[1]
      : "";

    const checkoutData = {
      productId: product._id,
      price: selectedPrice,
      name: formData.get("name"),
      email: formData.get("email"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      paymentMethod,
      cardName: formData.get("cardName"),
      cardNumber: formData.get("cardNumber"),
      expiry: formData.get("expiry"),
      cvv: formData.get("cvv"),
      isGuest: checkoutType === "guest",
      userId: checkoutType === "user" ? userId : undefined,
    };

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      });

      const payload = (await response.json()) as OrderResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to complete purchase.");
      }

      setSuccessOrder(payload);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to complete purchase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrder) {
    const isLoggedIn = typeof document !== "undefined" 
      ? document.cookie.includes("is_logged_in=true")
      : false;

    return (
      <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-8 text-center shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold text-emerald-300">Success</p>
        <h2 className="mt-4 text-3xl font-bold text-white">Order Confirmed</h2>
        <p className="mt-2 text-slate-300">
          Your purchase for {successOrder.product.brand} {successOrder.product.modelName} has been recorded.
        </p>
        <div className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-white/5 p-6 text-left text-sm text-slate-200 sm:grid-cols-3">
          <p><span className="text-slate-400">Order ID:</span> {successOrder.orderId}</p>
          <p><span className="text-slate-400">Total:</span> ${successOrder.product.price.toLocaleString()}</p>
          <p><span className="text-slate-400">Payment:</span> {successOrder.paymentMethod === "card" ? "Card" : "Cash"}</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Store
          </Link>
          {isLoggedIn && (
            <Link
              href="/profile"
              className="inline-block rounded-lg border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
            >
              View My Orders
            </Link>
          )}
          <Link
            href="/admin/dashboard"
            className="inline-block rounded-lg border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setIsUserLoggedIn(true);
          setCheckoutType("user");
        }}
      />

      {/* Guest vs User Choice */}
      {!checkoutType && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setCheckoutType("guest")}
            className="rounded-lg border-2 border-blue-500 bg-blue-500/10 p-6 text-left transition hover:bg-blue-500/20"
          >
            <h3 className="text-lg font-bold text-white">Continue as Guest</h3>
            <p className="mt-2 text-sm text-slate-300">Quick checkout without account</p>
          </button>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="rounded-lg border-2 border-emerald-500 bg-emerald-500/10 p-6 text-left transition hover:bg-emerald-500/20"
          >
            <h3 className="text-lg font-bold text-white">Login / Register</h3>
            <p className="mt-2 text-sm text-slate-300">Save order history and get faster checkout</p>
          </button>
        </div>
      )}

      {/* Checkout Form */}
      {checkoutType && (
        <form onSubmit={handleSubmit} className="grid gap-6 rounded-lg border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-500/10 p-4">
            <p className="text-sm font-semibold text-blue-300">
              {checkoutType === "guest" ? "Guest Checkout" : "Registered User Checkout"}
            </p>
            <button
              type="button"
              onClick={() => setCheckoutType(null)}
              className="text-xs font-semibold text-slate-400 transition hover:text-slate-300"
            >
              Change
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Name
              <input
                name="name"
                required
                className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                placeholder="Your full name"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-200">
              Email
              <input
                name="email"
                type="email"
                required
                className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Phone
              <input
                name="phone"
                required
                className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                placeholder="+1 555 000 000"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm text-slate-200">
            Address
            <textarea
              name="address"
              required
              rows={4}
              className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
              placeholder="Street, city, state, postal code"
            />
          </label>

          <div className="rounded-lg border border-white/10 bg-slate-950/45 p-5">
            <p className="text-sm font-semibold text-slate-300">Payment Method</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center gap-3 rounded-lg border px-4 py-4 text-left transition ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-400/30"
                }`}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="4.5" y="9" width="15" height="2" rx="1" fill="currentColor" />
                  <rect x="4.5" y="13" width="6" height="2" rx="1" fill="currentColor" />
                </svg>
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex items-center gap-3 rounded-lg border px-4 py-4 text-left transition ${
                  paymentMethod === "cash"
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-400/30"
                }`}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M8.5 12h7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Cash</span>
              </button>
            </div>

            {paymentMethod === "card" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200 sm:col-span-2">
                  Cardholder Name
                  <input
                    name="cardName"
                    required
                    className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                    placeholder="Name on card"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200 sm:col-span-2">
                  Card Number
                  <input
                    name="cardNumber"
                    required
                    inputMode="numeric"
                    className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                    placeholder="1234 5678 9012 3456"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Expiry
                  <input
                    name="expiry"
                    required
                    className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                    placeholder="MM/YY"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  CVV
                  <input
                    name="cvv"
                    required
                    inputMode="numeric"
                    className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100"
                    placeholder="123"
                  />
                </label>
              </div>
            ) : (
              <p className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Pay upon delivery.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Processing..." : "Complete Order"}
          </button>

          {errorMessage && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-red-200">
              {errorMessage}
            </div>
          )}
        </form>
      )}
    </>
  );
}
