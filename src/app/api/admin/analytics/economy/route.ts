import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/adminAuth';
import {
  buildEconomyForecast,
  seedEngineeringEconomyData,
} from '@/lib/prediction';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRole('manager');
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const seeded = seedEngineeringEconomyData(30);
    const forecast = buildEconomyForecast(seeded, 30);

    const paymentDistribution = seeded.reduce(
      (acc, item) => {
        acc[item.paymentMethod] += item.revenue;
        return acc;
      },
      { visa: 0, cash: 0 }
    );

    const totalActualRevenue = forecast.actual.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
    const forecastedRevenue = forecast.predicted.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    const targetRevenue = Math.round(totalActualRevenue * 1.1);

    return NextResponse.json({
      actualRevenue: forecast.actual,
      predictedRevenue: forecast.predicted,
      totalActualRevenue,
      forecastedRevenue,
      paymentDistribution,
      slope: forecast.slope,
      targetRevenue,
    });
  } catch (error) {
    console.error('Economy analytics error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
