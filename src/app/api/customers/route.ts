import { NextRequest, NextResponse } from 'next/server';
import customersData from '../../../data/customers.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('id');

  if (customerId) {
    const customer = customersData.find((c) => c.customerId === customerId);
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(customer);
  }

  return NextResponse.json(customersData);
}
