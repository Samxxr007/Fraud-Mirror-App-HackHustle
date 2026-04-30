'use client';
import { useState } from 'react';

const TOGGLE_SIGNALS: {
  id: string;
  label: string;
  icon: string;
  counterSignal: string;
  counterDetail: string;
  scoreImpact: number;
}[] = [
  {
    id: 'vpn',
    label: 'Use VPN / different IP',
    icon: '🌐',
    counterSignal: 'Behavioural Pattern',
    counterDetail: 'Claim value anomaly still detected — IP change doesn\'t mask purchase history',
    scoreImpact: -5,
  },
  {
    id: 'exif',
    label: 'Scrub EXIF from photo',
    icon: '📷',
    counterSignal: 'Image Forensics',
    counterDetail: 'Reverse image search still finds photo on fashion blog — EXIF removal flagged itself',
    scoreImpact: -3,
  },
  {
    id: 'newaccount',
    label: 'Create new account',
    icon: '👤',
    counterSignal: 'Network Graph',
    counterDetail: 'Device fingerprint shared with flagged ring — new account links back to same device cluster',
    scoreImpact: -8,
  },
  {
    id: 'device',
    label: 'Use different device',
    icon: '📱',
    counterSignal: 'Carrier Cross-Check',
    counterDetail: 'Delivery address still matches ring pattern — device change doesn\'t break address graph',
    scoreImpact: -4,
  },
  {
    id: 'address',
    label: 'Change delivery address',
    icon: '📍',
    counterSignal: 'Network Graph',
    counterDetail: 'New address already in rotating-address cluster Ring #B — pattern matches known fraud ring',
    scoreImpact: -2,
  },
  {
    id: 'receipt',
    label: 'Use edited receipt',
    icon: '🧾',
    counterSignal: 'Document Analysis',
    counterDetail: 'Font inconsistency and PDF metadata mismatch detected — editing leaves forensic fingerprints',
    scoreImpact: 20,
  },
];

export default function AdversarialPanel() {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const baseScore = 84;

  const score = Math.min(100, Math.max(10,
    TOGGLE_SIGNALS.reduce((acc, t) => acc + (active[t.id] ? t.scoreImpact : 0), baseScore)
  ));

  function scoreColor(s: number) {
    if (s <= 30) return '#22c55e';
    if (s <= 70) return '#f59e0b';
    return '#ef4444';
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Left — Fraudster controls */}
      <div style={{
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 16,
        padding: 24,
      }}>
        <h3 style={{ color: '#fca5a5', fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>
          🦹 Fraudster tries to game the system
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 20 }}>
          Toggle each evasion technique ON to see how Fraud Mirror adapts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TOGGLE_SIGNALS.map((t) => (
            <label key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              background: active[t.id] ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active[t.id] ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10, padding: '12px 14px',
              transition: 'all 0.2s',
            }}>
              <div
                onClick={() => setActive((a) => ({ ...a, [t.id]: !a[t.id] }))}
                style={{
                  width: 44, height: 24, borderRadius: 99, flexShrink: 0,
                  background: active[t.id] ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: active[t.id] ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
              <span style={{ fontSize: '0.85rem' }}>{t.icon}</span>
              <span style={{ fontSize: '0.82rem', color: active[t.id] ? '#fca5a5' : '#94a3b8', fontWeight: active[t.id] ? 600 : 400 }}>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Right — Fraud Mirror response */}
      <div style={{
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h3 style={{ color: '#93c5fd', fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>
          🪞 Fraud Mirror adapts
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 20 }}>
          For each evasion toggle, which signal still catches them:
        </p>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TOGGLE_SIGNALS.filter((t) => active[t.id]).length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#334155', fontSize: '0.85rem', textAlign: 'center',
            }}>
              Toggle an evasion technique on the left to see how we catch it →
            </div>
          ) : (
            TOGGLE_SIGNALS.filter((t) => active[t.id]).map((t) => (
              <div key={t.id} style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 10, padding: '12px 14px',
                animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  {t.icon} {t.counterSignal} still active
                </div>
                <p style={{ fontSize: '0.78rem', color: '#93c5fd', lineHeight: 1.5, margin: 0 }}>
                  "{t.counterDetail}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Live score */}
        <div style={{
          marginTop: 20,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: '16px 20px',
          textAlign: 'center',
          border: `1px solid ${scoreColor(score)}30`,
        }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Running Fraud Score
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: scoreColor(score), lineHeight: 1 }}>
            {score}<span style={{ fontSize: '1.5rem', color: '#475569' }}>/100</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: scoreColor(score), marginTop: 6, fontWeight: 600 }}>
            {score >= 71 ? '🚨 Still detected — cannot evade all signals' : score >= 31 ? '⚠️ Under review — partial evasion' : '✅ Below threshold'}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </div>
  );
}
