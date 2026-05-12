import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import NavSearch from "./NavSearch";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextGen Tech-Store | Premium Laptop Marketplace",
  description:
    "Curated selection of premium laptops for professionals and enthusiasts.",
};

const navigationItems = [
  { href: "/", label: "Shop" },
  { href: "/ai-match", label: "AI Match" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}>
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-3 transition">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/10 text-xs font-bold text-blue-300 shadow-lg transition group-hover:border-blue-400/60 group-hover:bg-blue-500/15">
                  NX
                </span>
                <div>
                  <p className="text-sm font-bold tracking-tight text-white">
                    NextGen Tech
                  </p>
                  <p className="text-xs text-slate-400">Premium Laptops</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden items-center gap-8 lg:flex">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
                >
                  Admin
                </Link>
              </nav>

              {/* Search - Hidden on mobile, shown on larger screens */}
              <div className="hidden w-full max-w-xs lg:block">
                <NavSearch />
              </div>

              {/* Mobile Menu Button (placeholder for future implementation) */}
              <button className="lg:hidden p-2 text-slate-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>

          {/* Mobile Search - Shown on mobile only */}
          <div className="sticky top-16 z-40 border-b border-white/10 bg-slate-950/40 backdrop-blur-md lg:hidden px-6 py-3">
            <NavSearch />
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}