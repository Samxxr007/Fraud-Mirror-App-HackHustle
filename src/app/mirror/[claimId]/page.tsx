'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import RiskGauge from '../../../components/RiskGauge';
import SignalCard from '../../../components/SignalCard';
import TrustScoreBar from '../../../components/TrustScoreBar';
import FastLaneApproval from '../../../components/FastLaneApproval';
import claimsData from '../../../data/claims.json';
import customersData from '../../../data/customers.json';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Claim {
  claimId: string;
  customerId: string;
  orderId: string;
  claimType: string;
  submittedAt: string;
  claimValue: number;
  totalScore: number;
  decision: 'approve' | 'review' | 'deny';
  fraudType: string | null;
  signalBreakdown: {
    B: number; M: number; N: number; G: number; C: number;
    weightedContributions: { B: number; M: number; N: number; G: number; C: number; };
  };
  customerExplanation: string;
  retailerEvidence: string[];
  ringId: string | null;
  reviewPriority: string;
}

function DecisionBadge({ decision }: { decision: string }) {
  const styles: Record<string, { bg: string; color: string; label: string; icon: string }> = {
    approve: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'APPROVED', icon: '✓' },
    review:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'UNDER REVIEW', icon: '⏱' },
    deny:    { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: 'DENIED', icon: '✕' },
  };
  const s = styles[decision] || styles.review;
  return (
    <div style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}40`,
      borderRadius: 99, padding: '6px 18px', display: 'inline-flex', alignItems: 'center', gap: 6,
      fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em',
    }}>
      <span>{s.icon}</span> {s.label}
    </div>
  );
}



const CUSTOMER_CHECK_ICONS = [
  { icon: '📷', label: 'Photo verified' },
  { icon: '📋', label: 'Order confirmed' },
  { icon: '🚚', label: 'Delivery checked' },
];

export default function MirrorPage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = use(params);
  const [activeTab, setActiveTab] = useState<'customer' | 'retailer'>('customer');
  const [claim, setClaim] = useState<Claim | null>(null);
  const [customer, setCustomer] = useState<typeof customersData[0] | null>(null);

  useEffect(() => {
    if (claimId === 'live') {
      const liveData = sessionStorage.getItem('lastAnalysis');
      if (liveData) {
        try {
          const res = JSON.parse(liveData);
          // Map API response (RiskScore interface) to Claim interface
          const mappedClaim: Claim = {
            claimId: res.claimId || 'LIVE-' + (res.orderId || 'NEW'),
            customerId: res.customerId || 'CUST-101',
            orderId: res.orderId || 'ORD-LIVE',
            claimType: res.claimType || 'damaged',
            submittedAt: res.analysedAt || new Date().toISOString(),
            claimValue: 1899,
            totalScore: res.totalScore || 0,
            decision: res.decision || 'review',
            fraudType: res.fraudType,
            signalBreakdown: res.signalBreakdown || {
              B: 0, M: 0, N: 0, G: 0, C: 0,
              weightedContributions: { B: 0, M: 0, N: 0, G: 0, C: 0 }
            },
            customerExplanation: res.customerExplanation || 'Analysis complete.',
            retailerEvidence: res.retailerEvidence || [],
            ringId: res.networkRingId || null,
            reviewPriority: res.reviewPriority || 'normal',
          };
          setClaim(mappedClaim);
          const cust = customersData.find((c) => c.customerId === mappedClaim.customerId);
          if (cust) setCustomer(cust);
          return;
        } catch (e) {
          console.error('Error parsing live data:', e);
        }
      }
    }

    const found = claimsData.find((c) => c.claimId === claimId) as any;
    if (found) {
      // Map legacy signals to new signalBreakdown for old mock data
      const mappedFound: Claim = {
        ...found,
        signalBreakdown: {
          B: found.signals?.behaviourScore || 0,
          M: found.signals?.imageScore || 0,
          N: found.signals?.networkScore || 0,
          G: found.signals?.docScore || 0, 
          C: found.signals?.carrierScore || 0,
          weightedContributions: {
            B: (found.signals?.behaviourScore || 0) * 0.30,
            M: (found.signals?.imageScore || 0) * 0.25,
            N: (found.signals?.networkScore || 0) * 0.20,
            G: (found.signals?.docScore || 0) * 0.15,
            C: (found.signals?.carrierScore || 0) * 0.10,
          }
        }
      };
      setClaim(mappedFound);
      const cust = customersData.find((c) => c.customerId === found.customerId);
      if (cust) setCustomer(cust);
    } else {
      // Try fetching from Firestore
      const fetchFromFirestore = async () => {
        try {
          const docRef = doc(db, "claims", claimId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as any;
            setClaim(data);
            const cust = customersData.find((c) => c.customerId === data.customerId);
            if (cust) setCustomer(cust);
          }
        } catch (e) {
          console.error("Firestore individual fetch error:", e);
        }
      };
      fetchFromFirestore();
    }
  }, [claimId]);

  if (!claim) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <p style={{ color: '#64748b' }}>Claim {claimId} not found in mock database.</p>
          <p style={{ color: '#334155', fontSize: '0.8rem', marginTop: 8 }}>Try CLM-001 through CLM-020</p>
        </div>
      </div>
    );
  }

  // Fast lane
  if (claim.totalScore <= 25 && claim.decision === 'approve') {
    return <FastLaneApproval claimValue={claim.claimValue} score={claim.totalScore} />;
  }

  const scoreColor = claim.totalScore <= 30 ? '#22c55e' : claim.totalScore <= 70 ? '#f59e0b' : '#ef4444';



  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#030712' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        background: 'rgba(15,23,42,0.9)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace' }}>CLAIM {claim.claimId} · ORDER {claim.orderId}</span>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', marginTop: 2 }}>🪞 Fraud Mirror — Live Analysis</h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <DecisionBadge decision={claim.decision} />
            {claim.ringId && (
              <a href={`/timeline/${claim.ringId}`} style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', borderRadius: 99, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700,
                textDecoration: 'none',
              }}>
                🔗 Ring {claim.ringId} →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div style={{ display: 'none' }} className="mobile-tabs">
        <div className="tab-bar" style={{ padding: '0 16px', display: 'flex' }}>
          <button className={`tab ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}>Your Status</button>
          <button className={`tab ${activeTab === 'retailer' ? 'active' : ''}`} onClick={() => setActiveTab('retailer')}>Details</button>
        </div>
      </div>

      {/* Split screen */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 128px)',
        gap: 0,
      }} className="mirror-grid">

        {/* ── LEFT PANEL — Retailer ── */}
        <div style={{
          borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '28px 24px',
          overflowY: 'auto',
          display: activeTab === 'retailer' || true ? 'block' : 'none',
        }} className="retailer-panel">
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              🔒 Internal Analysis — Retailer Only
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>Fraud Mirror Analysis</h2>
          </div>

          {/* Score + fraud type */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: 20,
          }}>
            <RiskGauge score={claim.totalScore} size="md" />
            <div>
              <DecisionBadge decision={claim.decision} />
              {claim.fraudType && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 2 }}>Fraud Type Detected</div>
                  <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.9rem' }}>{claim.fraudType}</div>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: claim.reviewPriority === 'urgent' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
                  color: claim.reviewPriority === 'urgent' ? '#fca5a5' : '#fcd34d',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {claim.reviewPriority} priority
                </span>
              </div>
            </div>
          </div>

          {/* Score Breakdown Bar */}
          <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Score Breakdown
            </div>
            
            {/* The Stacked Bar */}
            <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 16, background: 'rgba(255,255,255,0.05)' }}>
              {claim.signalBreakdown.weightedContributions.B > 0 && <div style={{ width: `${(claim.signalBreakdown.weightedContributions.B / Math.max(1, claim.totalScore)) * 100}%`, background: '#3b82f6' }} title={`Behavioural: ${claim.signalBreakdown.weightedContributions.B.toFixed(1)}`} />}
              {claim.signalBreakdown.weightedContributions.M > 0 && <div style={{ width: `${(claim.signalBreakdown.weightedContributions.M / Math.max(1, claim.totalScore)) * 100}%`, background: '#f59e0b' }} title={`Metadata: ${claim.signalBreakdown.weightedContributions.M.toFixed(1)}`} />}
              {claim.signalBreakdown.weightedContributions.N > 0 && <div style={{ width: `${(claim.signalBreakdown.weightedContributions.N / Math.max(1, claim.totalScore)) * 100}%`, background: '#a855f7' }} title={`Network: ${claim.signalBreakdown.weightedContributions.N.toFixed(1)}`} />}
              {claim.signalBreakdown.weightedContributions.G > 0 && <div style={{ width: `${(claim.signalBreakdown.weightedContributions.G / Math.max(1, claim.totalScore)) * 100}%`, background: '#14b8a6' }} title={`Geographic: ${claim.signalBreakdown.weightedContributions.G.toFixed(1)}`} />}
              {claim.signalBreakdown.weightedContributions.C > 0 && <div style={{ width: `${(claim.signalBreakdown.weightedContributions.C / Math.max(1, claim.totalScore)) * 100}%`, background: '#f43f5e' }} title={`Carrier: ${claim.signalBreakdown.weightedContributions.C.toFixed(1)}`} />}
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> B ({(claim.signalBreakdown.weightedContributions.B).toFixed(1)})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span> M ({(claim.signalBreakdown.weightedContributions.M).toFixed(1)})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#a855f7' }}></span> N ({(claim.signalBreakdown.weightedContributions.N).toFixed(1)})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#14b8a6' }}></span> G ({(claim.signalBreakdown.weightedContributions.G).toFixed(1)})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }}></span> C ({(claim.signalBreakdown.weightedContributions.C).toFixed(1)})</div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
              Formula: (B×0.30) + (M×0.25) + (N×0.20) + (G×0.15) + (C×0.10)
            </div>
          </div>

          {/* Evidence list */}
          {claim.retailerEvidence.length > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 12, padding: 16, marginBottom: 20,
            }}>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Evidence Trail
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {claim.retailerEvidence.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: 3, flexShrink: 0 }}>⚑</span>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ring indicator */}
          {claim.ringId && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, padding: 14, marginBottom: 20,
            }}>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700, marginBottom: 4 }}>🔗 Fraud Ring Detected</div>
              <p style={{ fontSize: '0.78rem', color: '#f87171' }}>
                Part of Ring {claim.ringId} — see full timeline for ring analysis
              </p>
              <a href={`/timeline/${claim.ringId}`} style={{
                display: 'inline-block', marginTop: 8, fontSize: '0.78rem', color: '#fca5a5',
                textDecoration: 'underline',
              }}>View Ring Timeline →</a>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-green" style={{ flex: 1, justifyContent: 'center', minWidth: 100 }}>✓ Approve</button>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', minWidth: 100 }}>⚠ Escalate</button>
            <button className="btn btn-red" style={{ flex: 1, justifyContent: 'center', minWidth: 100 }}>✕ Deny</button>
            {claim.ringId && (
              <button className="btn" style={{ flex: 1, justifyContent: 'center', minWidth: 100, background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                🔗 Flag Ring
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL — Customer ── */}
        <div style={{
          padding: '28px 24px',
          overflowY: 'auto',
          background: 'rgba(15,23,42,0.3)',
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Your Return Request
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>Status Update</h2>
          </div>

          {/* Big status */}
          <div style={{
            textAlign: 'center',
            padding: '36px 24px',
            background: claim.decision === 'approve' ? 'rgba(34,197,94,0.07)' : claim.decision === 'deny' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
            border: `1px solid ${claim.decision === 'approve' ? 'rgba(34,197,94,0.2)' : claim.decision === 'deny' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
            borderRadius: 16,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>
              {claim.decision === 'approve' ? '✅' : claim.decision === 'deny' ? '❌' : '⏳'}
            </div>
            <div style={{
              fontSize: '1.4rem', fontWeight: 800,
              color: claim.decision === 'approve' ? '#22c55e' : claim.decision === 'deny' ? '#ef4444' : '#f59e0b',
              marginBottom: 8,
            }}>
              {claim.decision === 'approve' ? 'Refund Approved!' : claim.decision === 'deny' ? 'Unable to Process' : 'Under Review'}
            </div>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', maxWidth: 340, margin: '0 auto' }}>
              {claim.customerExplanation}
            </p>
          </div>

          {/* What we checked */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
              What we checked
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {CUSTOMER_CHECK_ICONS.map((c) => (
                <div key={c.label} style={{
                  flex: 1, textAlign: 'center', padding: '14px 8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Specific outcome message */}
          {claim.decision === 'approve' && (
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 12, padding: 18, marginBottom: 20,
            }}>
              <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: 4, fontSize: '0.95rem' }}>
                💸 Refund of ₹{claim.claimValue.toLocaleString()} processed
              </div>
              <p style={{ fontSize: '0.82rem', color: '#4ade80' }}>
                Funds will reach your account within 2 hours. No further action needed.
              </p>
            </div>
          )}

          {claim.decision === 'review' && (
            <div style={{
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 12, padding: 18, marginBottom: 20,
            }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: 4, fontSize: '0.95rem' }}>
                🔍 Our team is on it
              </div>
              <p style={{ fontSize: '0.82rem', color: '#fcd34d' }}>
                We'll review your claim within 4 hours and notify you by email. No action needed from your side.
              </p>
            </div>
          )}

          {claim.decision === 'deny' && (
            <div style={{
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: 18, marginBottom: 20,
            }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8, fontSize: '0.95rem' }}>
                How to resubmit successfully
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Take a clear photo of the item with original tags still attached',
                  'Include the original receipt email from our platform',
                  'Contact support at support@example.com with your order ID',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.8rem', color: '#fca5a5' }}>
                    <span style={{ flexShrink: 0 }}>{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust score */}
          {customer && (
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 16,
            }}>
              <TrustScoreBar score={customer.trustScore} successfulReturns={customer.totalReturns} />
              <p style={{ fontSize: '0.72rem', color: '#334155', marginTop: 8 }}>
                Higher trust score = faster refunds and fewer reviews.{' '}
                <a href={`/trust/${customer.customerId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>View your profile →</a>
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mirror-grid { grid-template-columns: 1fr !important; }
          .retailer-panel { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); }
        }
      `}</style>
    </div>
  );
}
