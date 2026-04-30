'use client';
import { use } from 'react';
import Link from 'next/link';
import RiskGauge from '../../../components/RiskGauge';
import TrustScoreBar from '../../../components/TrustScoreBar';
import customersData from '../../../data/customers.json';

const TIER_INFO: Record<string, { color: string; desc: string; emoji: string }> = {
  Trusted:       { color: '#22c55e', desc: 'You get instant refunds with zero friction. Thank you for being a great customer.', emoji: '⭐' },
  'Good Standing': { color: '#3b82f6', desc: 'Your history looks solid. Keep it up for faster approvals.', emoji: '👍' },
  Building:      { color: '#f59e0b', desc: 'Your score is building. A few more verified returns and you\'ll unlock fast lane.', emoji: '🏗️' },
  'New Account': { color: '#94a3b8', desc: 'New accounts build trust quickly. A verified return adds +5 points instantly.', emoji: '🌱' },
  'At Risk':     { color: '#ef4444', desc: 'Your account has flags that affect claim processing. Contact support to resolve.', emoji: '⚠️' },
  Blocked:       { color: '#ef4444', desc: 'This account is blocked due to confirmed fraud activity.', emoji: '🚫' },
};

const SCORE_FACTORS = [
  { label: 'On-time return', impact: '+5 pts', color: '#22c55e', icon: '✓' },
  { label: 'Verified photo submitted', impact: '+3 pts', color: '#22c55e', icon: '✓' },
  { label: 'Consistent delivery address', impact: '+2 pts', color: '#22c55e', icon: '✓' },
  { label: 'Account age (per month, max 24)', impact: '+1 pt/mo', color: '#22c55e', icon: '✓' },
  { label: 'Unverified claim', impact: '−10 pts', color: '#ef4444', icon: '✕' },
  { label: 'INR claim (unconfirmed)', impact: '−8 pts', color: '#ef4444', icon: '✕' },
  { label: 'Denied claim', impact: '−15 pts', color: '#ef4444', icon: '✕' },
];

export default function TrustPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = use(params);
  const customer = customersData.find(c => c.customerId === customerId);

  if (!customer) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>👤</div>
          <p style={{ color: '#64748b' }}>Customer {customerId} not found.</p>
          <p style={{ color: '#334155', fontSize: '0.8rem', marginTop: 8 }}>Try CUST-101 through CUST-115</p>
        </div>
      </div>
    );
  }

  const tier = TIER_INFO[customer.tier] || TIER_INFO['New Account'];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#030712', padding: '40px 16px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/dashboard" style={{ fontSize: '0.78rem', color: '#475569', textDecoration: 'none' }}>← Dashboard</Link>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#f1f5f9', marginTop: 8, marginBottom: 4 }}>
              Trust Score Profile
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {customer.name} · {customer.customerId}
            </p>
          </div>
          <span style={{
            background: `${tier.color}15`, color: tier.color,
            border: `1px solid ${tier.color}30`, borderRadius: 99,
            padding: '6px 16px', fontWeight: 700, fontSize: '0.85rem',
          }}>
            {tier.emoji} {customer.tier}
          </span>
        </div>

        {/* Big score gauge */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '36px 32px', marginBottom: 24, textAlign: 'center',
        }}>
          <div style={{ marginBottom: 20 }}>
            <RiskGauge score={customer.trustScore} size="lg" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: tier.color, marginBottom: 8 }}>
            {customer.trustScore}/100 — {customer.tier}
          </div>
          <p style={{ color: '#64748b', maxWidth: 400, margin: '0 auto', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {tier.desc}
          </p>

          {customer.trustScore >= 80 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 99, padding: '8px 20px',
            }}>
              <span style={{ fontSize: '1rem' }}>⚡</span>
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>
                Fast Lane Enabled — Instant approvals with no review
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {[
            { label: 'Account Age', value: `${Math.floor(customer.accountAge / 30)} months`, icon: '📅' },
            { label: 'Total Orders', value: customer.totalOrders, icon: '🛍️' },
            { label: 'Return Rate', value: `${Math.round(customer.returnRate * 100)}%`, icon: '↩️', warn: customer.returnRate > 0.3 },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '16px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (s as any).warn ? '#ef4444' : '#f1f5f9' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Trust score bar */}
        <div style={{
          background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Score Overview</div>
          <TrustScoreBar score={customer.trustScore} successfulReturns={customer.totalReturns} />
          <p style={{ fontSize: '0.75rem', color: '#334155', marginTop: 10 }}>
            Your trust score means faster refunds. Trusted members (80+) get instant approval with no review.
          </p>
        </div>

        {/* Score factors */}
        <div style={{
          background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>How your score is calculated</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SCORE_FACTORS.map(f => (
              <div key={f.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px',
                background: `${f.color}08`, border: `1px solid ${f.color}15`,
                borderRadius: 8,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: f.color, fontSize: '0.8rem', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f.label}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: f.color, flexShrink: 0, marginLeft: 8 }}>{f.impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{
          background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {customer.recentActivity.slice(0, 5).map((a, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10,
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>{a.action}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: '0.85rem',
                  color: a.scoreImpact > 0 ? '#22c55e' : a.scoreImpact < 0 ? '#ef4444' : '#64748b',
                }}>
                  {a.scoreImpact > 0 ? '+' : ''}{a.scoreImpact !== 0 ? `${a.scoreImpact} pts` : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud flags */}
        {customer.fraudFlags.length > 0 && (
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 24,
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fca5a5', marginBottom: 12 }}>⚑ Account Flags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {customer.fraudFlags.map(f => (
                <span key={f} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#fca5a5', borderRadius: 99, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600,
                }}>
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* How to improve */}
        <div style={{
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 14, padding: '20px 24px',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#93c5fd', marginBottom: 12 }}>💡 How to improve your score</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Always include a clear photo when submitting a damage claim (+3 pts)',
              'Keep your delivery address consistent across orders (+2 pts per verified order)',
              'Use the same device when placing and returning orders (consistency signal)',
              'Submit claims promptly — within 48h of receiving damaged items',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.8rem', color: '#64748b' }}>
                <span style={{ color: '#3b82f6', flexShrink: 0 }}>→</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
