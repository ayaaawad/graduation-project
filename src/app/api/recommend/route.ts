import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { calculateMatchScore, getMatchPercentage } from "@/lib/recommend";
import Product from "@/models/Product";
import { seedProducts } from "@/data/products";

export const dynamic = "force-dynamic";

const normalizeNumber = (value: number, fallback: number) => {
  if (Number.isFinite(value)) {
    return value;
  }

  return fallback;
};

type FeatureSource = {
  aiFeatures?: {
    performance?: number | null;
    portability?: number | null;
    batteryEfficiency?: number | null;
  } | null;
};

type DbProduct = FeatureSource & {
  _id?: string;
  brand: string;
  modelName: string;
  price: number;
};

const normalizeFeatures = (product: FeatureSource) => {
  return {
    performance: normalizeNumber(product.aiFeatures?.performance ?? 6, 6),
    portability: normalizeNumber(product.aiFeatures?.portability ?? 6, 6),
    batteryEfficiency: normalizeNumber(product.aiFeatures?.batteryEfficiency ?? 6, 6),
  };
};

type RecommendRequest = {
  performanceScore: number;
  mobility: number;
  batteryEfficiency: number;
  budget: {
    min: number;
    max: number;
  };
};

export async function POST(request: Request) {
  let body: RecommendRequest | null = null;

  try {
    body = (await request.json()) as RecommendRequest;
  } catch {
    return NextResponse.json({ matches: [], reason: "invalid_payload" }, { status: 400 });
  }

  const budgetMin = normalizeNumber(body.budget?.min ?? 0, 0);
  const budgetMax = normalizeNumber(body.budget?.max ?? 0, 0);

  if (!budgetMin || !budgetMax || budgetMin > budgetMax) {
    return NextResponse.json({ matches: [], reason: "invalid_budget" }, { status: 400 });
  }

  const userVector = {
    performance: normalizeNumber(body.performanceScore, 6),
    portability: normalizeNumber(body.mobility, 6),
    batteryEfficiency: normalizeNumber(body.batteryEfficiency, 6),
  };

  let products: Array<DbProduct & { inStock: boolean }> = [];

  try {
    await connectToDatabase();
    const dbProducts = (await Product.find({}).lean()) as DbProduct[];
    const dbKeys = new Set(
      dbProducts.map((product) => `${product.brand}::${product.modelName}`)
    );

    const marketProducts = seedProducts
      .filter((product) => !dbKeys.has(`${product.brand}::${product.modelName}`))
      .map((product) => ({
        ...product,
        inStock: false,
      }));

    products = [
      ...dbProducts.map((product) => ({ ...product, inStock: true })),
      ...marketProducts,
    ];
  } catch {
    products = Array.from(seedProducts).map((product) => ({
      ...product,
      inStock: false,
    })) as Array<DbProduct & { inStock: boolean }>;
  }

  const inBudgetProducts = products.filter(
    (product) => product.price >= budgetMin && product.price <= budgetMax
  );

  if (inBudgetProducts.length === 0) {
    return NextResponse.json({ matches: [], reason: "no_budget_matches" }, { status: 200 });
  }

  const matches = inBudgetProducts
    .map((product) => {
      const productVector = normalizeFeatures(product);

      const distance = calculateMatchScore(userVector, productVector);

      return {
        product,
        distance,
        matchPercentage: getMatchPercentage(distance),
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return NextResponse.json({ matches }, { status: 200 });
}
