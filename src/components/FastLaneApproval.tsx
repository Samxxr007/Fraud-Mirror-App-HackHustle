'use client';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface FastLaneApprovalProps {
  claimValue: number;
  score: number;
}

export default function FastLaneApproval({ claimValue, score }: FastLaneApprovalProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#16a34a', '#86efac', '#bbf7d0'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#16a34a', '#86efac', '#bbf7d0'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #052e16 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 480,
        animation: 'fadeInUp 0.6s ease',
      }}>
        {/* Big checkmark */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 0 60px rgba(34,197,94,0.5)',
          animation: 'pulse 2s ease infinite',
        }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path d="M10 28L22 40L46 16" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 8,
          padding: '6px 16px',
          display: 'inline-block',
          marginBottom: 20,
        }}>
          <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ⚡ Fast Lane Approval
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          color: '#f8fafc',
          marginBottom: 12,
          lineHeight: 1.1,
        }}>
          Refund Approved<br />
          <span style={{ color: '#22c55e' }}>in 0.8 seconds</span>
        </h1>

        <p style={{ fontSize: '1.25rem', color: '#86efac', marginBottom: 8, fontWeight: 600 }}>
          ₹{claimValue.toLocaleString()} is on its way to your account
        </p>
        <p style={{ color: '#4ade80', marginBottom: 40, fontSize: '0.9rem' }}>
          Funds will arrive within 2 hours. No further action needed.
        </p>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          marginBottom: 40,
        }}>
          {[
            { label: 'Risk Score', value: `${score}/100` },
            { label: 'Processing', value: '0.8s' },
            { label: 'Status', value: 'Approved' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 10,
              padding: '12px 8px',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e' }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '16px 20px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged as</div>
          <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>✓ Fast Lane Approval — Zero friction, zero suspicion</div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 100px rgba(34,197,94,0.8); }
        }
      `}</style>
    </div>
  );
}
