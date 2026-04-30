'use client';
import dynamic from 'next/dynamic';

const NetworkGraph = dynamic(() => import('../../components/NetworkGraph'), { ssr: false });

const EVENTS = [
  { time: '09:12', text: 'Fraudster blocked at Retailer A — wardrobing signal triggered', color: '#ef4444' },
  { time: '09:18', text: 'Shared fingerprint propagated to network (anonymised)', color: '#8b5cf6' },
  { time: '15:41', text: 'Same fraudster attempted claim at Retailer C — blocked instantly', color: '#f59e0b' },
  { time: '16:02', text: 'Pattern matched Ring #B at Retailer D — pre-emptive flag raised', color: '#3b82f6' },
  { time: '18:30', text: 'Network flagged 3 new accounts matching fraud fingerprint', color: '#ef4444' },
];

export default function NetworkPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#030712', padding: '40px 16px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.2rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>
            Cross-Retailer Fraud Network
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Shared fraud signals across retailers — anonymised, privacy-preserving, zero PII shared.
          </p>
        </div>

        {/* Privacy banner */}
        <div style={{
          background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: '1.3rem' }}>🔒</span>
          <p style={{ color: '#4ade80', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong>Privacy-preserving:</strong> Only anonymised fraud fingerprints are shared between retailers. Zero customer PII (names, emails, addresses) ever leaves your system. Signals are one-way hashes of behavioural patterns.
          </p>
        </div>

        {/* Network graph */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#94a3b8' }}>Live Network Map</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { color: '#ef4444', label: 'Active fraud ring crossing retailers' },
                { color: '#8b5cf6', label: 'Shared fraud signal' },
                { color: '#3b82f6', label: 'Low-signal connection' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <NetworkGraph />
        </div>

        {/* Event feed */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
            🔴 Live Signal Feed — Today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EVENTS.map((e, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '12px 14px',
                background: `${e.color}08`,
                border: `1px solid ${e.color}20`,
                borderRadius: 10,
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569', flexShrink: 0, marginTop: 2 }}>{e.time}</span>
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>{e.text}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, flexShrink: 0, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
