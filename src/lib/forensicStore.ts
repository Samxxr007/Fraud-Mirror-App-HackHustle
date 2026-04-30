import 'server-only';
// Forensic Memory Store - High Performance Fallback for Demo
// This ensures that even if Firestore is down/lagging, the demo proceeds instantly.

type ForensicBaseline = {
  orderId: string;
  labels: string[];
  productName: string;
  serialNumbers: string[];
  timestamp: string;
};

class ForensicStore {
  private static instance: ForensicStore;
  private cache: Map<string, ForensicBaseline> = new Map();

  private constructor() {}

  public static getInstance(): ForensicStore {
    if (!ForensicStore.instance) {
      ForensicStore.instance = new ForensicStore();
    }
    return ForensicStore.instance;
  }

  public save(orderId: string, labels: string[], productName: string = 'Unknown Product', serialNumbers: string[] = []) {
    console.log(`[ForensicStore] Saving baseline for ${orderId} (${productName}):`, labels);
    this.cache.set(orderId, {
      orderId,
      labels,
      productName,
      serialNumbers,
      timestamp: new Date().toISOString(),
    });
  }

  public get(orderId: string): ForensicBaseline | null {
    const baseline = this.cache.get(orderId);
    if (baseline) {
      console.log(`[ForensicStore] Cache HIT for ${orderId}`);
      return baseline;
    }
    return null;
  }
}

export const forensicStore = ForensicStore.getInstance();
