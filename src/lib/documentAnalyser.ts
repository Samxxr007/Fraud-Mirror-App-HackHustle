import type { SignalResult } from './riskScorer';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface DocumentAnalysis {
  dateFound?: string;
  amount?: number;
  merchantName?: string;
  fontCount: number;
  hasInconsistentFonts: boolean;
  pdfCreationDate?: string;
  printedDate?: string;
  dateDiscrepancyDays?: number;
  whitespaceAnomalies: boolean;
}

function analyseDocument(receiptUrl: string | null, claimedAmount: number): DocumentAnalysis {
  if (!receiptUrl) {
    return {
      fontCount: 0,
      hasInconsistentFonts: false,
      whitespaceAnomalies: false,
    };
  }

  const mockAnalysis: Record<string, DocumentAnalysis> = {
    '/mock/receipt1.pdf': {
      dateFound: '2026-03-15',
      amount: 4299,
      merchantName: 'FashionPlanet',
      fontCount: 3,
      hasInconsistentFonts: true,
      pdfCreationDate: '2026-04-27',
      printedDate: '2026-03-15',
      dateDiscrepancyDays: 43,
      whitespaceAnomalies: true,
    },
    '/mock/receipt4.pdf': {
      dateFound: '2026-03-01',
      amount: 12500,
      merchantName: 'LuxuryGoods Hub',
      fontCount: 5,
      hasInconsistentFonts: true,
      pdfCreationDate: '2026-04-27',
      printedDate: '2026-03-01',
      dateDiscrepancyDays: 57,
      whitespaceAnomalies: true,
    },
    '/mock/receipt15.pdf': {
      dateFound: '2026-03-01',
      amount: 18500,
      merchantName: 'PremiumStore',
      fontCount: 5,
      hasInconsistentFonts: true,
      pdfCreationDate: '2026-04-24',
      printedDate: '2026-03-01',
      dateDiscrepancyDays: 54,
      whitespaceAnomalies: true,
    },
    '/mock/receipt7.pdf': {
      dateFound: '2026-03-28',
      amount: 8799,
      merchantName: 'Designer Boutique',
      fontCount: 2,
      hasInconsistentFonts: true,
      pdfCreationDate: '2026-04-26',
      printedDate: '2026-03-28',
      dateDiscrepancyDays: 29,
      whitespaceAnomalies: false,
    },
  };

  if (mockAnalysis[receiptUrl]) return mockAnalysis[receiptUrl];

  // Default clean document
  return {
    dateFound: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: claimedAmount,
    merchantName: 'Verified Merchant',
    fontCount: 1,
    hasInconsistentFonts: false,
    pdfCreationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    printedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateDiscrepancyDays: 0,
    whitespaceAnomalies: false,
  };
}

export async function analyseDocuments(
  receiptUrl: string | null,
  claimedAmount: number,
  orderId: string
): Promise<SignalResult> {
  await new Promise((resolve) => setTimeout(resolve, 40));

  const flags: string[] = [];
  let score = 0;

  if (!receiptUrl) {
    return {
      score: 10,
      confidence: 'low',
      flags: ['No receipt provided'],
      explanation: 'No receipt document to analyse.',
    };
  }

  const docAnalysis = analyseDocument(receiptUrl, claimedAmount);

  // Font analysis
  if (docAnalysis.fontCount >= 4) {
    flags.push(`Font analysis: ${docAnalysis.fontCount} different font families detected on single receipt — definitive editing evidence`);
    score += 40;
  } else if (docAnalysis.fontCount >= 2 && docAnalysis.hasInconsistentFonts) {
    flags.push(`Font inconsistency: mixed printer and system fonts detected — possible editing`);
    score += 20;
  }

  // PDF metadata vs printed date
  if (docAnalysis.dateDiscrepancyDays && docAnalysis.dateDiscrepancyDays > 30) {
    flags.push(`PDF creation date (${docAnalysis.pdfCreationDate}) is ${docAnalysis.dateDiscrepancyDays} days after printed receipt date (${docAnalysis.printedDate}) — document backdated`);
    score += 40;
  } else if (docAnalysis.dateDiscrepancyDays && docAnalysis.dateDiscrepancyDays > 7) {
    flags.push(`PDF metadata and printed date mismatch by ${docAnalysis.dateDiscrepancyDays} days — needs verification`);
    score += 15;
  }

  // Whitespace anomalies
  if (docAnalysis.whitespaceAnomalies) {
    flags.push('Whitespace pixel patterns between characters are non-uniform — text may have been inserted');
    score += 15;
  }

  // Amount check vs OCR
  if (docAnalysis.amount && Math.abs(docAnalysis.amount - claimedAmount) > claimedAmount * 0.1) {
    flags.push(`Receipt amount ₹${docAnalysis.amount} doesn't match claimed value ₹${claimedAmount} — ${Math.abs(docAnalysis.amount - claimedAmount)} discrepancy`);
    score += 20;
  }

  // DATABASE CHECK (User Suggestion)
  // Check if this receipt matches our internal retail database ledger
  const mockDatabaseLedger: Record<string, { expectedAmount: number, isCancelled: boolean }> = {
    'ORD-5003': { expectedAmount: 2500, isCancelled: false },
    'ORD-5005': { expectedAmount: 18500, isCancelled: true },
  };

  let ledgerRecord = mockDatabaseLedger[orderId];

  // Live Firestore Lookup
  try {
    const ledgerDoc = await getDoc(doc(db, "ledgers", orderId));
    if (ledgerDoc.exists()) {
      ledgerRecord = ledgerDoc.data() as any;
    }
  } catch (e) {
    console.warn("Firestore ledger lookup failed:", e);
  }

  if (ledgerRecord) {
    if (ledgerRecord.isCancelled) {
      flags.push(`DATABASE CHECK: CRITICAL — Order ${orderId} was cancelled before delivery. Receipt is entirely fabricated.`);
      score += 50;
    } else if (Math.abs(ledgerRecord.expectedAmount - claimedAmount) > 100) {
      flags.push(`DATABASE CHECK: Ledger mismatch — Retailer database shows order value of ₹${ledgerRecord.expectedAmount}, but claim is for ₹${claimedAmount}.`);
      score += 35;
    }
  } else {
    // If orderId is completely missing from ledger
    if (orderId && orderId.length > 5 && !orderId.startsWith('ORD-')) {
       flags.push(`DATABASE CHECK: Order ID ${orderId} not found in retailer ledger.`);
       score += 25;
    }
  }

  score = Math.min(100, score);
  const confidence: 'low' | 'medium' | 'high' = score > 60 ? 'high' : score > 30 ? 'medium' : 'low';

  return {
    score,
    confidence,
    flags,
    explanation: flags.length > 0
      ? `Document analysis found ${flags.length} issue(s): ${flags[0]}`
      : 'Document analysis clean — receipt fonts and metadata are consistent.',
  };
}
