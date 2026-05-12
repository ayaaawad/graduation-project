"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function UserNav() {
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const name = typeof document !== "undefined"
      ? document.cookie.split("; ").find(row => row.startsWith("user_name="))?.split("=")[1]
      : null;
    setUserName(name ? decodeURIComponent(name) : null);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    document.cookie = "user_email=; max-age=0";
    document.cookie = "user_name=; max-age=0";
    document.cookie = "user_id=; max-age=0";
    document.cookie = "is_logged_in=; max-age=0";
    setUserName(null);
    setMenuOpen(false);
    window.location.reload();
  };

  if (userName) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="hidden sm:inline">{userName}</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-slate-950/90 shadow-lg backdrop-blur-sm z-50">
            <Link
              href="/profile"
              className="block px-4 py-3 text-sm text-slate-300 hover:bg-white/5 border-b border-white/10"
            >
              My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/checkout"
      className="flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/15"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span className="hidden sm:inline">Login</span>
    </Link>
  );
}
