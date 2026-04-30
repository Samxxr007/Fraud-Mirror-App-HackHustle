'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthorisePage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = use(params);
  const [claim, setClaim] = useState<any>(null);

  useEffect(() => {
    // Attempt to load live data if testing
    const liveData = sessionStorage.getItem('lastAnalysis');
    if (liveData) {
      setClaim(JSON.parse(liveData));
    }
  }, []);

  if (!claim) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', color: '#f1f5f9' }}>
        Loading Courier Gate Data...
      </div>
    );
  }

  const { courierStatus, finalScore, hardOverride, hardOverrideReason } = claim;

  // Determine styling based on Courier Status
  const getStatusStyles = () => {
    switch (courierStatus) {
      case 'GREEN': return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '#22c55e' };
      case 'AMBER': return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '#f59e0b' };
      case 'RED': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '#ef4444' };
      default: return { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '#fff' };
    }
  };

  const styles = getStatusStyles();

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Courier Dispatch Gate</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Order ID: {claim.orderId} • Claim ID: {claim.claimId}</p>
          </div>
          <Link href={`/mirror/live`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>← Back to Mirror</Link>
        </header>

        <div style={{
          background: styles.bg,
          border: `2px solid ${styles.border}`,
          borderRadius: 16,
          padding: 40,
          textAlign: 'center'
        }}>
          
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: styles.color, marginBottom: 8, letterSpacing: '0.1em' }}>
            STATUS: {courierStatus}
          </div>
          
          <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 30 }}>
            {courierStatus === 'GREEN' && 'PICKUP AUTHORISED'}
            {courierStatus === 'AMBER' && 'HOLD — VERIFICATION REQUIRED'}
            {courierStatus === 'RED' && 'PICKUP BLOCKED'}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 24, textAlign: 'left', display: 'inline-block', minWidth: 400 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>Action Log</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {courierStatus === 'GREEN' && (
                <li>
                  <span style={{ color: '#22c55e', marginRight: 8 }}>✓</span> 
                  Webhook status: Dispatch signal sent to Delhivery
                </li>
              )}

              {courierStatus === 'AMBER' && (
                <>
                  <li>
                    <span style={{ color: '#f59e0b', marginRight: 8 }}>✓</span> 
                    WhatsApp status: Video request sent to customer
                  </li>
                  <li>
                    <span style={{ color: '#f59e0b', marginRight: 8 }}>⏱</span> 
                    Countdown: Auto-escalates to RED in 24 hours if no response
                  </li>
                </>
              )}

              {courierStatus === 'RED' && (
                <>
                  <li>
                    <span style={{ color: '#ef4444', marginRight: 8 }}>✕</span> 
                    Pickup API disabled for this order
                  </li>
                  {hardOverride && (
                    <li style={{ color: '#ef4444', fontWeight: 700 }}>
                      <span style={{ marginRight: 8 }}>!</span> 
                      HARD OVERRIDE: {hardOverrideReason}
                    </li>
                  )}
                  <li>
                    <span style={{ color: '#22c55e', marginRight: 8 }}>✓</span> 
                    Retailer alert sent
                  </li>
                </>
              )}
              
            </ul>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button 
              disabled={courierStatus === 'RED'}
              style={{
                background: courierStatus === 'RED' ? '#334155' : '#3b82f6',
                color: courierStatus === 'RED' ? '#94a3b8' : '#fff',
                border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700,
                cursor: courierStatus === 'RED' ? 'not-allowed' : 'pointer'
              }}
            >
              Force Dispatch API Sync
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
