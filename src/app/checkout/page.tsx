import Link from "next/link";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongoose";
import Product from "@/models/Product";
import CheckoutForm from "./CheckoutForm";

type CheckoutPageProps = {
  searchParams?: Promise<{
    productId?: string;
    price?: string;
  }>;
};

type CheckoutProduct = {
  _id: string;
  brand: string;
  modelName: string;
  price: number;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const productId = resolvedSearchParams.productId;
  const passedPrice = Number(resolvedSearchParams.price);

  if (!productId) {
    notFound();
  }

  await connectToDatabase();
  const productRaw = (await Product.findById(productId).lean()) as any | null;

  if (!productRaw) {
    notFound();
  }

  const product: CheckoutProduct = {
    ...productRaw,
    _id: productRaw._id?.toString() ?? "",
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
        <Link href={`/products/${product._id}`} className="text-sm font-semibold text-blue-300 transition hover:text-blue-200">
          Back to product
        </Link>

        <div className="mt-6 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-300">Checkout</p>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Complete your order</h1>
          <p className="text-sm text-slate-300">
            {product.brand} {product.modelName} - {`$${product.price.toLocaleString()}`}
          </p>
          {Number.isFinite(passedPrice) && passedPrice > 0 && passedPrice !== product.price && (
            <p className="text-xs text-slate-400">
              Selected listing price: ${passedPrice.toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-8">
          <CheckoutForm product={product} selectedPrice={Number.isFinite(passedPrice) ? passedPrice : product.price} />
        </div>
      </div>
    </div>
  );
}
