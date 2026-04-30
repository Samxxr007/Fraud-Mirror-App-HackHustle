'use client';

interface SignalCardProps {
  name: string;
  icon: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  flags: string[];
  explanation: string;
  weight: string;
}

function scoreColor(score: number) {
  if (score <= 30) return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' };
  if (score <= 70) return { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' };
  return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' };
}

function confidenceBadge(conf: 'low' | 'medium' | 'high') {
  const styles: Record<string, { bg: string; text: string }> = {
    high: { bg: 'rgba(239,68,68,0.2)', text: '#fca5a5' },
    medium: { bg: 'rgba(245,158,11,0.2)', text: '#fcd34d' },
    low: { bg: 'rgba(148,163,184,0.2)', text: '#94a3b8' },
  };
  return styles[conf];
}

export default function SignalCard({
  name, icon, score, confidence, flags, explanation, weight,
}: SignalCardProps) {
  const colors = scoreColor(score);
  const badge = confidenceBadge(confidence);

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: '16px',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>{name}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Weight: {weight}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.text }}>{score}</span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 99,
            background: badge.bg, color: badge.text, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>{confidence} confidence</span>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: colors.text,
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 6px ${colors.text}80`,
        }} />
      </div>

      {/* Explanation */}
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: flags.length > 0 ? 10 : 0, lineHeight: 1.5 }}>
        {explanation}
      </p>

      {/* Flags */}
      {flags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {flags.slice(0, 3).map((flag, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: colors.text, fontSize: '0.7rem', marginTop: 2, flexShrink: 0 }}>⚑</span>
              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.4 }}>{flag}</span>
            </div>
          ))}
          {flags.length > 3 && (
            <span style={{ fontSize: '0.65rem', color: '#475569' }}>+{flags.length - 3} more flags</span>
          )}
        </div>
      )}
    </div>
  );
}
