import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Order from '@/models/Order';
import { verifyAdminRole } from '@/lib/adminAuth';
import {
  calculateForecast,
  generateFakeSalesHistory,
  type SalesDataPoint,
} from '@/lib/prediction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRole('manager');
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch all orders from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .lean()
      .sort({ createdAt: 1 });

    // Group orders by date and calculate daily revenue
    const salesByDate = new Map<string, { revenue: number; count: number }>();

    for (const order of orders) {
      const date = new Date(order.createdAt as any).toISOString().split('T')[0];
      const current = salesByDate.get(date) || { revenue: 0, count: 0 };

      current.revenue += (order.price as number) || 0;
      current.count += 1;

      salesByDate.set(date, current);
    }

    // Convert to SalesDataPoint format
    const salesHistory: SalesDataPoint[] = Array.from(salesByDate.entries()).map(([date, data]) => ({
      date: new Date(date),
      revenue: data.revenue,
      sales_count: data.count,
    }));

    // If no sales history, create dummy data for demonstration
    if (salesHistory.length === 0) {
      salesHistory.push(...generateFakeSalesHistory(30));
    }

    // Generate prediction for next 14 days
    const prediction = calculateForecast(salesHistory, 14);

    return NextResponse.json({
      success: true,
      ...prediction,
      dataPoints: salesHistory.length,
    });
  } catch (error) {
    console.error('Prediction error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
