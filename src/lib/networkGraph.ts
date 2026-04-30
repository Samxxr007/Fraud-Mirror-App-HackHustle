import type { SignalResult } from './riskScorer';
import customers from '../data/customers.json';
import rings from '../data/rings.json';

interface GraphNode {
  id: string;
  type: 'account' | 'device' | 'address' | 'ip';
  value: string;
}

interface GraphEdge {
  from: string;
  to: string;
  attribute: 'device' | 'address' | 'ip';
}

function buildGraph(customerId: string): { nodes: GraphNode[]; edges: GraphEdge[]; ringId: string | null } {
  const customer = customers.find((c) => c.customerId === customerId);
  if (!customer) return { nodes: [], edges: [], ringId: null };

  const nodes: GraphNode[] = [{ id: customerId, type: 'account', value: customer.name }];
  const edges: GraphEdge[] = [];
  let detectedRingId: string | null = null;

  // Check if this customer is in a ring
  for (const ring of rings) {
    const isMember = ring.members.some((m) => m.customerId === customerId);
    if (isMember) {
      detectedRingId = ring.ringId;
      break;
    }
  }

  // Add device nodes
  customer.deviceIds.forEach((deviceId) => {
    nodes.push({ id: deviceId, type: 'device', value: deviceId });
    edges.push({ from: customerId, to: deviceId, attribute: 'device' });

    // Find other accounts sharing this device
    customers.forEach((otherCust) => {
      if (otherCust.customerId !== customerId && otherCust.deviceIds.includes(deviceId)) {
        nodes.push({ id: otherCust.customerId, type: 'account', value: otherCust.name });
        edges.push({ from: otherCust.customerId, to: deviceId, attribute: 'device' });
      }
    });
  });

  return { nodes, edges, ringId: detectedRingId };
}

function detectRing(customerId: string): {
  isRingMember: boolean;
  ringId: string | null;
  memberCount: number;
  totalClaimed: number;
  sharedAttribute: string;
} {
  for (const ring of rings) {
    const isMember = ring.members.some((m) => m.customerId === customerId);
    if (isMember) {
      return {
        isRingMember: true,
        ringId: ring.ringId,
        memberCount: ring.memberCount,
        totalClaimed: ring.totalClaimed,
        sharedAttribute: ring.sharedAttribute,
      };
    }
  }
  return { isRingMember: false, ringId: null, memberCount: 0, totalClaimed: 0, sharedAttribute: '' };
}

export async function analyseNetwork(customerId: string): Promise<SignalResult & {
  ringId: string | null;
  memberCount: number;
  totalClaimed: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 30));

  const flags: string[] = [];
  let score = 0;

  const customer = customers.find((c) => c.customerId === customerId);
  const graph = buildGraph(customerId);
  const ringInfo = detectRing(customerId);

  if (ringInfo.isRingMember) {
    flags.push(
      `Part of confirmed fraud Ring #${ringInfo.ringId} — ${ringInfo.memberCount} members, ₹${ringInfo.totalClaimed.toLocaleString()} total claimed`
    );
    score += 60;

    flags.push(
      `Shared attribute: ${ringInfo.sharedAttribute} — used to link ring members`
    );
    score += 20;
  }

  // Check shared devices across accounts (beyond ring detection)
  if (customer) {
    const sharedDeviceAccounts: string[] = [];
    customer.deviceIds.forEach((deviceId) => {
      customers.forEach((other) => {
        if (other.customerId !== customerId && other.deviceIds.includes(deviceId)) {
          sharedDeviceAccounts.push(other.customerId);
        }
      });
    });

    if (sharedDeviceAccounts.length >= 3 && !ringInfo.isRingMember) {
      flags.push(`Device shared with ${sharedDeviceAccounts.length} other accounts — ring candidate`);
      score += 35;
    } else if (sharedDeviceAccounts.length >= 1 && !ringInfo.isRingMember) {
      flags.push(`Device shared with ${sharedDeviceAccounts.length} other account(s)`);
      score += 15;
    }

    // IP rotation check
    const ipFlags = customer.ipHistory.filter((ip) =>
      ip.startsWith('VPN') || ip.startsWith('RING')
    );
    if (ipFlags.length > 0) {
      flags.push('VPN / rotating IP detected — obfuscating network identity');
      score += 15;
    }
  }

  score = Math.min(100, score);
  const confidence: 'low' | 'medium' | 'high' =
    ringInfo.isRingMember ? 'high' : score > 30 ? 'medium' : 'low';

  return {
    score,
    confidence,
    flags,
    explanation: ringInfo.isRingMember
      ? `Network graph: confirmed ring member (Ring ${ringInfo.ringId})`
      : flags.length > 0
      ? `Network analysis: ${flags[0]}`
      : 'Network analysis clean — no shared device or address flags.',
    ringId: ringInfo.ringId,
    memberCount: ringInfo.memberCount,
    totalClaimed: ringInfo.totalClaimed,
  };
}
