'use client';
import Link from 'next/link';

const FEATURES = [
  { icon: '📷', title: 'Image Forensics', desc: 'EXIF metadata extraction, GPS cross-check, reverse image search, pixel noise analysis.' },
  { icon: '🧾', title: 'Document Analysis', desc: 'PDF font consistency, metadata date vs printed date, whitespace pixel patterns.' },
  { icon: '👤', title: 'Behavioural Pattern', desc: 'Return rate analysis, claim frequency, new-account-high-value detection.' },
  { icon: '🚚', title: 'Carrier Cross-Check', desc: 'Delivery scan vs INR claim, signature verification, GPS delivery proof.' },
  { icon: '🕸️', title: 'Network Graph', desc: 'Device/address/IP clustering, fraud ring detection, organised fraud scoring.' },
];

const STATS = [
  { value: '87%', label: 'Fraud catch rate' },
  { value: '0.8s', label: 'Fast lane approval' },
  { value: '3.2%', label: 'False positive rate' },
  { value: '₹4.15L', label: 'Blocked today' },
];

const DEMO_CLAIMS = [
  { id: 'CLM-001', label: 'Wardrobing (Deny)', score: 82, color: '#ef4444' },
  { id: 'CLM-002', label: 'INR — Fast Lane Approve', score: 14, color: '#22c55e' },
  { id: 'CLM-003', label: 'Damaged — Review', score: 55, color: '#f59e0b' },
  { id: 'CLM-004', label: 'Document Fraud (Deny)', score: 91, color: '#ef4444' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#030712', minHeight: '100vh' }}>
      {/* Hero section */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 99, padding: '6px 18px', marginBottom: 32 }}>
            <span style={{ fontSize: '1rem' }}>🪞</span>
            <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hackathon Build — Fraud Mirror v1.0</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#f8fafc', marginBottom: 24 }}>Every other system gives a <span style={{ color: '#ef4444' }}>score.</span><br />Fraud Mirror gives a <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>reason.</span></h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#64748b', maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.7 }}>Return fraud detection that shows its work — to both the retailer and the customer, simultaneously.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>Go to Shopping App →</Link>
            <Link href="/dashboard" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 28px' }}>Retailer Dashboard</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
