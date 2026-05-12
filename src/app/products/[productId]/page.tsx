import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/models/Product";
import ClientProductGallery from "./ClientProductGallery";
import LaptopGallery from "@/components/LaptopGallery";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

type ProductDetail = {
  _id: string;
  brand: string;
  modelName: string;
  category: string;
  price: number;
  stock: number;
  condition: string;
  image?: string;
  images?: string[];
  display?: { screenSize?: number; resolution?: string; isTouchScreen?: boolean };
  storage?: { capacity?: string; type?: string };
  ram?: { size?: string };
  processor?: { modelName?: string };
  battery?: { capacity?: string; estimatedRuntimeHours?: number };
  gpu?: { modelName?: string; vram?: string };
};

const formatPrice = (value: number) => `$${value.toLocaleString()}`;

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  await connectToDatabase();
  const productRaw = (await Product.findById(productId).lean()) as any | null;

  if (!productRaw) {
    notFound();
  }

  const product: ProductDetail = {
    ...productRaw,
    _id: productRaw._id?.toString() ?? '',
  };

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];

  // Check if we have all 4 angles (front, side, back, top)
  const hasAllAngles = images.length === 4 && images.every((img) => img && img.trim());

  const angleImages = hasAllAngles ? {
    front: images[0],
    side: images[1],
    back: images[2],
    top: images[3]
  } : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
        <Link href="/" className="text-sm font-semibold text-blue-300 transition hover:text-blue-200">
          Back to inventory
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Product Detail</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--text-primary)]">
              {product.brand} {product.modelName}
            </h1>
            <p className="mt-3 text-sm text-slate-300">{product.category}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p>
                <p className="mt-2 text-2xl font-semibold text-blue-200">{formatPrice(product.price)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stock</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{product.stock}</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-6">
                {angleImages && hasAllAngles ? (
                  <LaptopGallery 
                    images={angleImages}
                    productName={`${product.brand} ${product.modelName}`}
                    brandModel={`${product.brand} ${product.modelName}`}
                  />
                ) : (
                  <ClientProductGallery images={images} productName={`${product.brand} ${product.modelName}`} productId={product._id} />
                )}
              </div>
            )}

            <div className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p>Condition: {product.condition}</p>
              <p>Display: {product.display?.screenSize}&quot;</p>
              <p>Resolution: {product.display?.resolution}</p>
              <p>Touch Screen: {product.display?.isTouchScreen ? "Yes" : "No"}</p>
              <p>RAM: {product.ram?.size}</p>
              <p>Storage: {product.storage?.capacity}</p>
              <p>Processor: {product.processor?.modelName}</p>
              <p>GPU: {product.gpu?.modelName}</p>
              <p>Battery: {product.battery?.estimatedRuntimeHours} hrs</p>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
            <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Purchase</p>
            <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">Ready to buy?</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Proceed to checkout to enter shipping and payment details.
            </p>
            <Link
              href={`/checkout?productId=${product._id}&price=${product.price}`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.32)] transition hover:bg-blue-400"
            >
              Buy Now
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
