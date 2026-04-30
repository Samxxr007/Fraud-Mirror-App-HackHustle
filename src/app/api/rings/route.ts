import { NextRequest, NextResponse } from 'next/server';
import ringsData from '../../../data/rings.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ringId = searchParams.get('id');

  if (ringId) {
    const ring = ringsData.find((r) => r.ringId === ringId);
    if (!ring) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ring);
  }

  return NextResponse.json(ringsData);
}
