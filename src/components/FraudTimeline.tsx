'use client';
import { useState, useEffect, useRef } from 'react';

interface TimelineNode {
  date: string;
  claimId: string;
  customerId: string;
  claimValue: number;
  claimType: string;
  decision: string;
  connections: string[];
}

interface Ring {
  ringId: string;
  name: string;
  memberCount: number;
  totalClaimed: number;
  fraudType: string;
  sharedAttribute: string;
  earlierDetectionPossible: number;
  timeline: TimelineNode[];
  description: string;
}

interface FraudTimelineProps {
  ring: Ring;
}

function decisionColor(decision: string) {
  if (decision === 'approve') return '#22c55e';
  if (decision === 'review') return '#f59e0b';
  return '#ef4444';
}

function connectionColor(attr: string) {
  if (attr === 'device') return '#3b82f6';
  if (attr === 'address') return '#ef4444';
  return '#8b5cf6';
}

export default function FraudTimeline({ ring }: FraudTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sorted = [...ring.timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  function play() {
    setVisibleCount(0);
    setPlaying(true);
    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= sorted.length) {
        clearInterval(intervalRef.current!);
        setPlaying(false);
      }
    }, 600);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleCount(0);
    setPlaying(false);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const sharedAttrColor = ring.sharedAttribute === 'device' ? '#3b82f6' : ring.sharedAttribute === 'ip_address' ? '#8b5cf6' : '#ef4444';

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 12, padding: '14px 20px',
        display: 'flex', flexWrap: 'wrap', gap: 16,
        alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ring {ring.ringId}</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9' }}>{ring.name}</div>
        </div>
        {[
          { label: 'Members', value: ring.memberCount },
          { label: 'Total Claimed', value: `₹${ring.totalClaimed.toLocaleString()}` },
          { label: 'Fraud Type', value: ring.fraudType },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
        <div style={{
          background: `${sharedAttrColor}20`,
          border: `1px solid ${sharedAttrColor}40`,
          borderRadius: 99, padding: '4px 12px',
          fontSize: '0.75rem', fontWeight: 600, color: sharedAttrColor,
        }}>
          🔗 Shared: {ring.sharedAttribute.replace('_', ' ')}
        </div>
        <div style={{
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', color: '#4ade80',
        }}>
          Earlier detection possible at claim #{ring.earlierDetectionPossible}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={play} disabled={playing} style={{
          background: playing ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.2)',
          border: '1px solid rgba(59,130,246,0.4)',
          color: '#93c5fd', borderRadius: 8, padding: '8px 20px',
          cursor: playing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
          transition: 'all 0.2s',
        }}>
          {playing ? '⏸ Playing...' : '▶ Replay Timeline'}
        </button>
        <button onClick={reset} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#64748b', borderRadius: 8, padding: '8px 16px',
          cursor: 'pointer', fontSize: '0.85rem',
        }}>↺ Reset</button>
        <button onClick={() => setVisibleCount(sorted.length)} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#64748b', borderRadius: 8, padding: '8px 16px',
          cursor: 'pointer', fontSize: '0.85rem',
        }}>Show All</button>
      </div>

      {/* Timeline nodes */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: 0, paddingBottom: 16,
        scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent',
        alignItems: 'center',
      }}>
        {sorted.map((node, i) => {
          const visible = i < visibleCount || visibleCount === 0;
          const color = decisionColor(node.decision);
          return (
            <div key={node.claimId} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {/* Connection line */}
              {i > 0 && (
                <div style={{
                  width: 40, height: 2,
                  background: visible
                    ? `linear-gradient(90deg, ${decisionColor(sorted[i - 1].decision)}, ${color})`
                    : 'rgba(255,255,255,0.05)',
                  transition: 'background 0.4s',
                }} />
              )}
              {/* Node */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                opacity: visible || visibleCount === 0 ? 1 : 0.15,
                transform: visible || visibleCount === 0 ? 'scale(1)' : 'scale(0.8)',
                transition: 'opacity 0.4s, transform 0.4s',
                minWidth: 120,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: `${color}20`, border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 16px ${color}40`,
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>
                    {node.decision === 'approve' ? '✓' : node.decision === 'review' ? '?' : '✕'}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#475569', marginBottom: 2 }}>
                    {new Date(node.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>{node.customerId.replace('CUST-', '#')}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>₹{node.claimValue.toLocaleString()}</div>
                  <div style={{
                    fontSize: '0.6rem', padding: '1px 6px', borderRadius: 99,
                    background: `${color}20`, color, marginTop: 3, fontWeight: 600,
                  }}>{node.decision.toUpperCase()}</div>
                  {node.connections.length > 0 && (
                    <div style={{ fontSize: '0.6rem', color: '#8b5cf6', marginTop: 2 }}>
                      🔗 {node.connections.length} link{node.connections.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#22c55e', label: 'Approved (missed by system)' },
          { color: '#f59e0b', label: 'Under Review' },
          { color: '#ef4444', label: 'Denied (caught)' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
