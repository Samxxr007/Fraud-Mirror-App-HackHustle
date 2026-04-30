import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Seed a successful delivery scan for the user's demo order
    const orderId = 'ord 0111';
    await setDoc(doc(db, "deliveries", orderId), {
      fingerprint: 'vfh_728394',
      capturedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      itemType: 'Electronics',
      status: 'DELIVERED'
    });

    return NextResponse.json({ 
      success: true, 
      message: `Mock delivery scan seeded for order ${orderId}. Live scan will now detect a match.` 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
