import type { SignalResult } from './riskScorer';
import customers from '../data/customers.json';

interface CustomerProfile {
  customerId: string;
  accountAge: number;
  totalOrders: number;
  totalReturns: number;
  returnRate: number;
  priorClaims: number;
  priorFraudFlags: number;
  avgClaimValue: number;
  deviceIds: string[];
  addressHistory: string[];
  ipHistory: string[];
}

function getCustomerProfile(customerId: string): CustomerProfile | null {
  const customer = customers.find((c) => c.customerId === customerId);
  if (!customer) return null;
  return {
    customerId: customer.customerId,
    accountAge: customer.accountAge,
    totalOrders: customer.totalOrders,
    totalReturns: customer.totalReturns,
    returnRate: customer.returnRate,
    priorClaims: customer.priorClaims,
    priorFraudFlags: customer.priorFraudFlags,
    avgClaimValue: customer.avgClaimValue,
    deviceIds: customer.deviceIds,
    addressHistory: customer.addressHistory,
    ipHistory: customer.ipHistory,
  };
}

export async function analyseBehaviour(
  customerId: string,
  claimValue: number,
  submittedAt: string
): Promise<SignalResult> {
  await new Promise((resolve) => setTimeout(resolve, 30));

  const flags: string[] = [];
  let score = 0;

  const profile = getCustomerProfile(customerId);
  
  if (!profile) {
    // Unknown customer — moderate risk
    return {
      score: 45,
      confidence: 'low',
      flags: ['Customer profile not found in database'],
      explanation: 'No customer history available for analysis.',
    };
  }

  // Return rate check
  if (profile.returnRate > 0.50) {
    flags.push(`Return rate ${Math.round(profile.returnRate * 100)}% — extremely high (threshold: 30%)`);
    score += 30;
  } else if (profile.returnRate > 0.30) {
    flags.push(`Return rate ${Math.round(profile.returnRate * 100)}% — above 30% threshold`);
    score += 20;
  }

  // Prior fraud flags
  if (profile.priorFraudFlags >= 3) {
    flags.push(`${profile.priorFraudFlags} prior fraud flags on this account`);
    score += 25;
  } else if (profile.priorFraudFlags >= 1) {
    flags.push(`${profile.priorFraudFlags} prior fraud flag(s) noted`);
    score += 12;
  }

  // Multiple recent claims (mock: use priorClaims as proxy for last 90 days)
  if (profile.priorClaims >= 4) {
    flags.push(`${profile.priorClaims} claims filed recently — excessive claim frequency`);
    score += 20;
  } else if (profile.priorClaims >= 3) {
    flags.push(`${profile.priorClaims} claims in recent period`);
    score += 10;
  }

  // New account with high claim value
  if (profile.accountAge < 30 && claimValue > 5000) {
    flags.push(`Account only ${profile.accountAge} days old but claim value ₹${claimValue.toLocaleString()} — new account high-value pattern`);
    score += 25;
  } else if (profile.accountAge < 60 && claimValue > 10000) {
    flags.push(`Young account (${profile.accountAge} days) with premium claim value ₹${claimValue.toLocaleString()}`);
    score += 15;
  }

  // Claim value vs average
  if (profile.avgClaimValue > 0 && claimValue > profile.avgClaimValue * 3) {
    flags.push(`Claim value ₹${claimValue.toLocaleString()} is ${Math.round(claimValue / profile.avgClaimValue)}x average claim value of ₹${profile.avgClaimValue.toLocaleString()} for this account`);
    score += 15;
  }

  score = Math.min(100, score);
  const confidence: 'low' | 'medium' | 'high' = score > 60 ? 'high' : score > 30 ? 'medium' : 'low';

  return {
    score,
    confidence,
    flags,
    explanation: flags.length > 0
      ? `Behavioural analysis found ${flags.length} anomaly/anomalies: ${flags[0]}`
      : 'Behavioural pattern clean — return history within normal parameters.',
  };
}
