'use client';
import AdversarialPanel from '../../components/AdversarialPanel';

export default function SimulatePage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#030712', padding: '40px 16px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 99, padding: '6px 18px',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ⚔️ Adversarial Hardening Simulator
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: 12 }}>
            Can Fraudsters Game the System?
          </h1>
          <p style={{ color: '#64748b', maxWidth: 600, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Toggle evasion techniques a fraudster might use. Watch how Fraud Mirror's multi-signal architecture catches them anyway — because no single signal works alone.
          </p>
        </div>

        <div style={{
          background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 28, marginBottom: 24,
        }}>
          <AdversarialPanel />
        </div>

        {/* Key insight */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 16, padding: '24px 28px',
        }}>
          <h3 style={{ color: '#93c5fd', fontWeight: 800, marginBottom: 8 }}>🧠 Why multi-signal works</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 700 }}>
            A fraudster can scrub EXIF, use a VPN, and create a new account — but they can't simultaneously change their device fingerprint, match a new delivery address that's not in a fraud cluster, AND produce a receipt that passes font analysis. Fraud Mirror requires fraudsters to defeat all 5 signals simultaneously, which is practically impossible without triggering even more flags.
          </p>
        </div>
      </div>
    </div>
  );
}
