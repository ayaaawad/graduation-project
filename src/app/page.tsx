import Link from "next/link";
import HeroSection from "./HeroSection";
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/models/Product";

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

type CatalogProduct = {
  _id: string;
  brand: string;
  modelName: string;
  category: string;
  price: number;
  stock: number;
  condition: string;
  image?: string;
  images?: string[];
  ram?: { size?: string };
  storage?: { capacity?: string };
  processor?: { modelName?: string };
  battery?: { estimatedRuntimeHours?: number };
  display?: { screenSize?: number; isTouchScreen?: boolean };
};

const highlights = [
  {
    title: "Store Performance",
    value: "Live KPI surface",
    detail: "Track demand, stock health, and category movement from a single command center.",
  },
  {
    title: "AI Matching",
    value: "Similarity engine",
    detail: "Surface related products by vector-style similarity signals and merchandising context.",
  },
  {
    title: "Operations",
    value: "Admin-ready",
    detail: "Organize catalog, insights, and workflows in a dashboard designed for decision makers.",
  },
];

const formatPrice = (price: number) => `$${price.toLocaleString()}`;

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = resolvedSearchParams.q?.trim().toLowerCase() ?? "";

  await connectToDatabase();

  const productsRaw = (await Product.find({}).sort({ brand: 1, modelName: 1 }).lean()) as any[];
  const products: CatalogProduct[] = productsRaw.map((p) => ({
    ...p,
    _id: p._id?.toString() ?? '',
  }));
  const filteredProducts = query
    ? products.filter((product) => {
        const searchableText = [product.brand, product.modelName, product.category, product.processor?.modelName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
    : products;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <HeroSection />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Live Inventory</p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">Browse all laptops first</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              These products are fetched directly from MongoDB. Search by brand, model, category, or processor.
            </p>
          </div>

          <form className="w-full max-w-xl" method="get">
            <label className="sr-only" htmlFor="inventory-search">
              Search inventory
            </label>
            <div className="flex gap-3">
              <input
                id="inventory-search"
                name="q"
                defaultValue={resolvedSearchParams.q ?? ""}
                placeholder="Search laptops by brand, model, or processor..."
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-100 backdrop-blur-xl placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.32)] transition hover:bg-blue-400"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {filteredProducts.length} of {products.length} laptops
          </span>
          {query && <span>Search: {query}</span>}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6 text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">No laptops found.</p>
            <p className="mt-2 text-sm text-slate-400">
                No exact match in stock. Would you like our AI to find the perfect alternative?
            </p>
            <Link
              href="/ai-match"
              className="mt-5 inline-flex rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.32)]"
            >
                Open AI Matcher
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const productId = String(product._id);
              const primaryImage = product.images?.[0] ?? product.image;
              const thumbnails = product.images?.slice(1, 4) ?? [];

              return (
                <article
                  key={productId}
                  className="group hover-lift overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 backdrop-blur-sm shadow-md transition hover:border-blue-400/40"
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
                          {product.category}
                        </p>
                        <h3 className="mt-2 text-lg font-bold tracking-tight text-white">
                          {product.brand} {product.modelName}
                        </h3>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                        {product.condition}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-300">{formatPrice(product.price)}</p>
                  </div>

                  {/* Main Image */}
                  {primaryImage ? (
                    <div className="px-6 pb-4">
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/50" style={{ aspectRatio: '4/3' }}>
                        <img
                          src={primaryImage}
                          alt={`${product.brand} ${product.modelName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 pb-4">
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-800/50 flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                        <div className="text-center">
                          <svg className="w-16 h-16 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-slate-500 text-sm">No image available</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Gallery */}
                  {thumbnails.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-3 gap-2">
                        {thumbnails.filter(img => img).map((img, idx) => (
                          <div key={idx} className="overflow-hidden rounded-md border border-white/10" style={{ aspectRatio: '4/3' }}>
                            <img
                              src={img}
                              alt={`View ${idx + 2}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specs */}
                  <div className="px-6 pb-4">
                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Specs</p>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <p className="text-xs text-slate-500">Processor</p>
                          <p className="text-sm font-medium">{product.processor?.modelName ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">RAM</p>
                          <p className="text-sm font-medium">{product.ram?.size ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Storage</p>
                          <p className="text-sm font-medium">{product.storage?.capacity ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Battery</p>
                          <p className="text-sm font-medium">{product.battery?.estimatedRuntimeHours ?? "—"} hrs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock & Actions */}
                  <div className="px-6 py-4 border-t border-white/10 bg-slate-950/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        <span className="font-semibold text-white">{product.stock}</span> in stock
                      </span>
                      <span className="text-slate-400">
                        {product.display?.isTouchScreen ? "✓ Touchscreen" : "Non-touch"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/products/${productId}`}
                        className="flex-1 inline-flex items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 hover:border-blue-400/50"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/checkout?productId=${productId}&price=${product.price}`}
                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
                      >
                        Buy
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="hover-lift rounded-xl border border-white/10 bg-slate-950/40 p-6 shadow-md transition backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">{item.title}</p>
            <h2 className="mt-3 text-2xl font-bold text-white">{item.value}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
