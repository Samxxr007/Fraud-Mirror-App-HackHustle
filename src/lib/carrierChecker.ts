import type { SignalResult } from './riskScorer';
import carrier from '../data/carrier.json';

interface CarrierRecord {
  orderId: string;
  scanTimestamp: string | null;
  deliveryAddress: string;
  deliveryConfirmed: boolean;
  signatureObtained: boolean;
  photoOnDelivery: boolean;
  gpsVerified: boolean;
  returnRequestDate: string;
  daysGap: number | null;
}

function getCarrierRecord(orderId: string): CarrierRecord | null {
  const record = carrier.find((c) => c.orderId === orderId);
  return record ? (record as CarrierRecord) : null;
}

export async function checkCarrier(
  orderId: string,
  claimType: string,
  claimAddress: string
): Promise<SignalResult> {
  await new Promise((resolve) => setTimeout(resolve, 40));

  const flags: string[] = [];
  let score = 0;

  const record = getCarrierRecord(orderId);

  if (!record) {
    return {
      score: 20,
      confidence: 'low',
      flags: ['No carrier record found for this order ID'],
      explanation: 'No carrier data available to cross-check.',
    };
  }

  const isINR = claimType === 'inr' || claimType === 'friendly_fraud';

  // INR claim but delivery confirmed
  if (isINR && record.deliveryConfirmed) {
    flags.push(
      `Carrier confirms delivery${record.gpsVerified ? ' with GPS verification' : ''}${record.signatureObtained ? ' and signature obtained' : ''}${record.photoOnDelivery ? ' and photo captured' : ''}`
    );
    score += 40;

    if (record.signatureObtained) {
      flags.push('Digital signature collected at delivery — unambiguous proof of receipt');
      score += 20;
    }
    if (record.photoOnDelivery) {
      flags.push('Photo-on-delivery captured — item visible in transit image');
      score += 15;
    }
  }

  // No delivery scan but INR claimed — supports customer
  if (isINR && !record.deliveryConfirmed && !record.scanTimestamp) {
    // This is fine — no evidence against customer
    score = 10;
    return {
      score,
      confidence: 'high',
      flags: ['Carrier: no delivery confirmation scan found — supports INR claim'],
      explanation: 'Carrier data supports the claim — no delivery confirmation on record.',
    };
  }

  // Days gap between delivery and return request
  if (record.daysGap !== null) {
    if (record.daysGap > 20) {
      flags.push(
        `Delivery-to-return gap: ${record.daysGap} days — far outside standard return window`
      );
      score += 15;
    } else if (record.daysGap > 10 && claimType === 'damaged') {
      flags.push(
        `Damage claim filed ${record.daysGap} days after delivery — delayed reporting is unusual for physical damage`
      );
      score += 10;
    }
  }

  // Address mismatch
  if (
    record.deliveryAddress &&
    claimAddress &&
    !record.deliveryAddress.toLowerCase().includes(claimAddress.toLowerCase().split(',')[0])
  ) {
    flags.push(
      `Delivery address on record (${record.deliveryAddress}) differs from claim address`
    );
    score += 20;
  }

  score = Math.min(100, score);
  const confidence: 'low' | 'medium' | 'high' =
    record.deliveryConfirmed && record.signatureObtained
      ? 'high'
      : record.deliveryConfirmed
      ? 'medium'
      : 'low';

  return {
    score,
    confidence,
    flags,
    explanation:
      flags.length > 0
        ? `Carrier data: ${flags[0]}`
        : 'Carrier data consistent with claim — no delivery confirmation conflicts.',
  };
}
