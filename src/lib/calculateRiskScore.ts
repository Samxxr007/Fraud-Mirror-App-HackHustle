export interface RiskInput {
  userId: string;
  deviceId: string;
  ipAddress: string;
  itemPrice: number;
  deliveryAddress: string;
  deliveryDate: string;
  photoCreationDate: string | null;
  photoGPS: { lat: number, lng: number } | null;
  deliveryGPS: { lat: number, lng: number } | null;
  isPixelPerfect: boolean;
  priorReturns: number;
  priorFraudFlags: number;
  returnDaysSinceDelivery: number;
  isPostHoliday: boolean;
  claimType: string;
  deliveryConfirmed: boolean;
  signatureObtained: boolean;
  claimAddress: string;
}

export interface RiskOutput {
  finalScore: number;
  decision: 'approve' | 'review' | 'deny';
  courierStatus: 'GREEN' | 'AMBER' | 'RED';
  webhookAction: string;
  signalBreakdown: {
    B: number;
    M: number;
    N: number;
    G: number;
    C: number;
    weights: {
      B: number;
      M: number;
      N: number;
      G: number;
      C: number;
    };
    weightedContributions: {
      B: number;
      M: number;
      N: number;
      G: number;
      C: number;
    };
  };
  flags: string[];
  hardOverride: boolean;
  hardOverrideReason: string | null;
  customerMessage: string;
  retailerEvidence: string[];
  whatsappMessage?: string;
  retailerAlert?: string;
}

// Mock functions for missing dependencies
function getAccountsByDevice(deviceId: string) {
  // Mock implementation
  if (deviceId === 'shared-dev-1') return [{ id: 'u1', isFraudBlocked: false }, { id: 'u2', isFraudBlocked: false }];
  if (deviceId === 'shared-dev-blocked') return [{ id: 'u1', isFraudBlocked: true }, { id: 'u2', isFraudBlocked: false }];
  return [{ id: 'u1', isFraudBlocked: false }];
}

function getAccountsByIP(ipAddress: string) {
  // Mock implementation
  if (ipAddress === '192.168.1.100') return [1, 2, 3];
  if (ipAddress === '10.0.0.5') return [1, 2, 3, 4, 5, 6];
  return [1];
}

function calculateDistanceKm(coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}) {
  // Haversine formula approximation for mock
  const R = 6371; // km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function calculateRiskScore(input: RiskInput): RiskOutput {
  const flags: string[] = [];
  const retailerEvidence: string[] = [];

  // SIGNAL B — Behavioural Score (weight 0.30)
  let B = 0;
  if (input.priorReturns === 0 || input.priorReturns === 1) B += 0;
  if (input.priorReturns >= 2 && input.priorReturns <= 5) B += 30;
  if (input.priorReturns > 5) B += 60;

  if (input.priorFraudFlags >= 1) B += 25;
  if (input.priorFraudFlags >= 3) B = Math.min(B + 40, 100);

  if (input.isPostHoliday && input.returnDaysSinceDelivery <= 3) B += 20;

  if (input.itemPrice > 10000) B += 20;
  if (input.itemPrice > 50000) B += 10;

  if (input.returnDaysSinceDelivery === 0) B += 30;

  B = Math.min(B, 100);
  if (B > 0) flags.push(`Behavioural anomalies detected (Score: ${B})`);

  // SIGNAL M — Metadata Score (weight 0.25)
  let M = 0;
  if (input.photoCreationDate !== null) {
    if (new Date(input.photoCreationDate) < new Date(input.deliveryDate)) {
      M = 100;
      flags.push('PHOTO_PREDATES_DELIVERY');
      retailerEvidence.push('Photo metadata indicates it was taken before the item was delivered.');
    }
  }

  if (input.photoCreationDate === null) {
    M += 40;
    retailerEvidence.push('Image lacks EXIF data; likely downloaded from web.');
  }

  if (input.photoGPS && input.deliveryGPS) {
    const distance = calculateDistanceKm(input.photoGPS, input.deliveryGPS);
    if (distance > 1) {
      M += 20;
      retailerEvidence.push(`Photo GPS is ${Math.round(distance)}km from delivery address.`);
    }
    if (distance > 10) M += 30;
  }

  if (!input.photoGPS) M += 15;
  if (input.isPixelPerfect) {
    M += 25;
    retailerEvidence.push('Image appears to be pixel-perfect, potentially sourced from a catalog.');
  }

  M = Math.min(M, 100);

  // SIGNAL N — Network Score (weight 0.20)
  let N = 0;
  const linkedAccounts = getAccountsByDevice(input.deviceId);
  if (linkedAccounts.length > 1) N += 30;
  if (linkedAccounts.length > 3) N += 50;

  const hasBlockedLinkedAccount = linkedAccounts.some(a => a.isFraudBlocked);
  if (hasBlockedLinkedAccount) {
    N += 50;
    flags.push('BLOCKED_DEVICE_LINK');
    retailerEvidence.push('Device is linked to a previously blocked fraudulent account.');
  }

  const ipAccounts = getAccountsByIP(input.ipAddress);
  if (ipAccounts.length > 2) N += 20;
  if (ipAccounts.length > 5) N += 30;

  N = Math.min(N, 100);

  // SIGNAL G — Geographic Score (weight 0.15)
  let G = 0;
  let blacklistedZones: {area: string, pincode: string, riskLevel: string}[] = [];
  try {
    blacklistedZones = require('../data/blacklisted-zones.json');
  } catch (e) {
    // Fallback if file not ready
    blacklistedZones = [];
  }

  const isBlacklisted = blacklistedZones.some(zone =>
    zone.riskLevel === 'high' && (input.deliveryAddress.includes(zone.pincode) || input.deliveryAddress.includes(zone.area))
  );

  if (isBlacklisted) {
    G += 60;
    retailerEvidence.push('Delivery address is in a known high-risk/blacklisted zone.');
  }

  const isMediumRisk = blacklistedZones.some(zone =>
    zone.riskLevel === 'medium' && input.deliveryAddress.includes(zone.pincode)
  );

  if (isMediumRisk) G += 25;

  G = Math.min(G, 100);

  // SIGNAL C — Carrier Score (weight 0.10)
  let C = 0;
  if (input.deliveryConfirmed && input.claimType === 'inr') {
    C += 70;
    flags.push('CARRIER_INR_CONFLICT');
    retailerEvidence.push('Customer claims Item Not Received (INR), but carrier confirmed delivery.');
  }

  if (input.signatureObtained && input.claimType === 'damaged') {
    C += 30;
    retailerEvidence.push('Customer signed for package without noting damage at delivery.');
  }

  if (input.deliveryAddress !== input.claimAddress) {
    C += 40;
    retailerEvidence.push('Claim submitted from an address different than delivery.');
  }

  C = Math.min(C, 100);

  // Combine Into Final Score
  let finalScore = (B * 0.30) + (M * 0.25) + (N * 0.20) + (G * 0.15) + (C * 0.10);
  finalScore = Math.round(finalScore);

  let hardOverride = false;
  let hardOverrideReason = null;

  // HARD OVERRIDES
  if (flags.includes('PHOTO_PREDATES_DELIVERY')) {
    finalScore = 100;
    hardOverride = true;
    hardOverrideReason = 'Photo predates delivery date';
  }

  if (flags.includes('KNOWN_FRAUD_IMAGE')) {
    finalScore = 95;
    hardOverride = true;
    hardOverrideReason = 'Known fraud image hash match';
  }

  if (hasBlockedLinkedAccount && B > 50) {
    finalScore = Math.max(finalScore, 85);
    hardOverride = true;
    hardOverrideReason = 'Blocked device linked to high-risk behavior';
  }

  // Generate Decision
  let decision: 'approve' | 'review' | 'deny' = 'review';
  let courierStatus: 'GREEN' | 'AMBER' | 'RED' = 'AMBER';
  let webhookAction = '';
  let customerMessage = '';
  let whatsappMessage: string | undefined;
  let retailerAlert: string | undefined;

  if (finalScore <= 40) {
    decision = 'approve';
    courierStatus = 'GREEN';
    webhookAction = 'DISPATCH_IMMEDIATELY';
    customerMessage = `Refund approved! ₹${input.itemPrice.toLocaleString()} reaches your account in 2 hours.`;
  } else if (finalScore > 40 && finalScore <= 70) {
    decision = 'review';
    courierStatus = 'AMBER';
    webhookAction = 'HOLD_DISPATCH';
    whatsappMessage = 'Please upload a 5-second video of the item seal to proceed with your return.';
    customerMessage = 'We need one more step to verify your return. Check WhatsApp.';
  } else {
    decision = 'deny';
    courierStatus = 'RED';
    webhookAction = 'BLOCK_PICKUP';
    retailerAlert = 'High risk return detected. Call customer before proceeding.';
    customerMessage = 'We could not verify your return request. Our team will contact you within 24 hours.';
  }

  return {
    finalScore,
    decision,
    courierStatus,
    webhookAction,
    signalBreakdown: {
      B, M, N, G, C,
      weights: { B: 0.30, M: 0.25, N: 0.20, G: 0.15, C: 0.10 },
      weightedContributions: {
        B: B * 0.30,
        M: M * 0.25,
        N: N * 0.20,
        G: G * 0.15,
        C: C * 0.10
      }
    },
    flags,
    hardOverride,
    hardOverrideReason,
    customerMessage,
    retailerEvidence,
    whatsappMessage,
    retailerAlert
  };
}
