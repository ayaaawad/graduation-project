import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
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

    const orders = await SpecialOrder.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Special orders fetch error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
