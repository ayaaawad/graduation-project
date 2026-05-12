import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Product from '@/models/Product';
import { verifyAdminRole } from '@/lib/adminAuth';
import SpecialOrder from '@/models/SpecialOrder';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRole('manager');
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectToDatabase();

    const products = await Product.find({}).lean();

    // compute totals, tolerate missing sales_count
    let totalRevenue = 0;
    let totalSold = 0;
    let currentStockCount = 0;

    for (const p of products) {
      const sales = (p as any).sales_count ?? 0;
      totalSold += sales;
      totalRevenue += sales * (p.price ?? 0);
      currentStockCount += p.stock ?? 0;
    }

    // inventory breakdown by condition (sum stock)
    const inventoryBreakdown = { new: 0, used: 0 };
    for (const p of products) {
      if ((p.condition || '').toLowerCase() === 'new') inventoryBreakdown.new += p.stock ?? 0;
      else inventoryBreakdown.used += p.stock ?? 0;
    }

    // top performers by sales_count
    const topPerformers = products
      .map((p) => ({ modelName: p.modelName, sales_count: ((p as any).sales_count ?? 0), price: p.price ?? 0 }))
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 5);

    // match accuracy: attempt to read aiMatches collection
    let matchAccuracy = { highMatch: 0, fallback: 0 };
    try {
      const conn = (await import('mongoose')).connection;
      const col = conn.collection('aiMatches');
      const docs = await col.find({}).toArray();
      if (docs && docs.length > 0) {
        const high = docs.filter((d:any) => (d.score ?? 0) > 0.9).length;
        matchAccuracy = { highMatch: high, fallback: docs.length - high };
      }
    } catch (e) {
      // ignore if collection missing
    }

    const specialOrders = await SpecialOrder.aggregate([
      {
        $group: {
          _id: { brand: '$brand', modelName: '$modelName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const mostRequestedOutOfStock = {
      totalRequests: specialOrders.reduce((sum: number, item: any) => sum + item.count, 0),
      topItems: specialOrders.map((item: any) => ({
        brand: item._id.brand,
        modelName: item._id.modelName,
        count: item.count,
      })),
    };

    return NextResponse.json({
      totalRevenue,
      totalSold,
      currentStockCount,
      inventoryBreakdown,
      topPerformers,
      matchAccuracy,
      mostRequestedOutOfStock,
    });
  } catch (error) {
    console.error('Analytics error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
