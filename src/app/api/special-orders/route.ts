import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import SpecialOrder from '@/models/SpecialOrder';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      brand?: string;
      modelName?: string;
      matchScore?: number;
    };

    if (!body.email || !body.brand || !body.modelName || body.matchScore == null) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await connectToDatabase();

    const specialOrder = await SpecialOrder.create({
      email: body.email,
      brand: body.brand,
      modelName: body.modelName,
      matchScore: body.matchScore,
    });

    return NextResponse.json({ success: true, order: specialOrder }, { status: 201 });
  } catch (error) {
    console.error('Special order error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
