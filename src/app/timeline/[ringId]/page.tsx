'use client';
import { useState } from 'react';
import { use } from 'react';
import FraudTimeline from '../../../components/FraudTimeline';
import ringsData from '../../../data/rings.json';
import Link from 'next/link';

export default function TimelinePage({ params }: { params: Promise<{ ringId: string }> }) {
  const { ringId } = use(params);
  const [selectedRingId, setSelectedRingId] = useState(ringId);
  const ring = ringsData.find(r => r.ringId === selectedRingId) || ringsData[0];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#030712', padding: '32px 16px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/dashboard" style={{ fontSize: '0.78rem', color: '#475569', textDecoration: 'none' }}>← Dashboard</Link>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 900, color: '#f1f5f9', marginTop: 8, marginBottom: 4 }}>
              Fraud Ring Replay Timeline
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Visualise how a fraud ring operated — claim by claim, in chronological order.
            </p>
          </div>

          {/* Ring selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {ringsData.map(r => (
              <button key={r.ringId} onClick={() => setSelectedRingId(r.ringId)} style={{
                padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: selectedRingId === r.ringId ? '#ef4444' : 'rgba(239,68,68,0.1)',
                color: selectedRingId === r.ringId ? 'white' : '#fca5a5',
              }}>
                {r.ringId}
              </button>
            ))}
          </div>
        </div>

        {/* Ring description */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 28, marginBottom: 24,
        }}>
          <div style={{ marginBottom: 4, fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            Ring Description
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7 }}>{ring.description}</p>
        </div>

        {/* Timeline */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 28,
        }}>
          <FraudTimeline ring={ring as Parameters<typeof FraudTimeline>[0]['ring']} />
        </div>

        {/* Members table */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 28, marginTop: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>
            Ring Members ({ring.memberCount})
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Claims</th>
                <th>Total Claimed</th>
                <th>Joined Ring</th>
              </tr>
            </thead>
            <tbody>
              {ring.members.map(m => (
                <tr key={m.customerId}>
                  <td>
                    <Link href={`/trust/${m.customerId}`} style={{ color: '#fca5a5', textDecoration: 'none', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {m.customerId}
                    </Link>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{m.claimIds.join(', ')}</td>
                  <td style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>₹{m.totalClaimed.toLocaleString()}</td>
                  <td style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {new Date(m.joinedRingAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
