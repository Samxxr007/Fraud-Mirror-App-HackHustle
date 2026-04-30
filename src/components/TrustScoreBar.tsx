'use client';

interface TrustScoreBarProps {
  score: number;
  successfulReturns?: number;
  showLabel?: boolean;
}

function getTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Trusted', color: '#22c55e' };
  if (score >= 50) return { label: 'Good Standing', color: '#3b82f6' };
  if (score >= 20) return { label: 'Building', color: '#f59e0b' };
  return { label: 'New Account', color: '#94a3b8' };
}

export default function TrustScoreBar({ score, successfulReturns = 0, showLabel = true }: TrustScoreBarProps) {
  const tier = getTier(score);

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Your Trust Score: <strong style={{ color: tier.color }}>{score}/100</strong>
            {successfulReturns > 0 && ` — ${successfulReturns} successful returns`}
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: 99, background: `${tier.color}20`, color: tier.color,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{tier.label}</span>
        </div>
      )}
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`,
          borderRadius: 99,
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 10px ${tier.color}60`,
        }} />
      </div>
    </div>
  );
}
