import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const productName = formData.get('productName') as string || 'Unknown Product';
    const labels = JSON.parse(formData.get('labels') as string || '[]');
    const serialNumbers = JSON.parse(formData.get('serialNumbers') as string || '[]');
    const timestamp = new Date().toISOString();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. SAVE TO MEMORY (Instant Demo Fallback)
    const { forensicStore } = await import('../../../lib/forensicStore');
    forensicStore.save(orderId, labels, productName, serialNumbers);

    // 2. SAVE TO FIRESTORE (Background/Non-blocking)
    setDoc(doc(db, "deliveries", orderId), {
      orderId,
      productName,
      labels,
      serialNumbers,
      fingerprintDate: timestamp,
      status: 'Verified',
      type: 'baseline'
    }).catch(e => console.error("Firestore background save failed, but memory store is active."));

    return NextResponse.json({ success: true, timestamp, mode: 'high-performance-hybrid' });
  } catch (error: any) {
    console.error('Delivery save failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
