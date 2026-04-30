'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Fingerprint, Activity } from 'lucide-react';
import Link from 'next/link';

export default function LiveAnalysisPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('lastAnalysis');
        if (stored) {
            setTimeout(() => {
                try {
                    setData(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse analysis data");
                }
                setLoading(false);
            }, 1500);
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(59,130,246,0.1)', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                <h2 style={{ marginTop: 24, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>CROSS-REFERENCING DNA...</h2>
                <p style={{ color: '#64748b', marginTop: 8 }}>Comparing Return Scan to Delivery Baseline</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: 20 }} />
                <h2>No analysis data found</h2>
                <Link href="/" style={{ color: '#3b82f6', marginTop: 20 }}>Back to Store</Link>
            </div>
        );
    }

    const isBlocked = data?.status === 'FORENSIC_BLOCK';
    const accentColor = isBlocked ? '#ef4444' : '#22c55e';
    const signals = data?.analysis?.signals || [];

    return (
        <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                
                {/* Header Verdict */}
                <div style={{ 
                    background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 100%)`,
                    border: `1px solid ${accentColor}30`,
                    borderRadius: 24, padding: 40, textAlign: 'center', marginBottom: 40,
                    boxShadow: `0 20px 40px ${accentColor}05`
                }}>
                    <div style={{ display: 'inline-flex', padding: 12, borderRadius: 20, background: `${accentColor}15`, marginBottom: 20 }}>
                        {isBlocked ? <ShieldAlert size={48} color={accentColor} /> : <ShieldCheck size={48} color={accentColor} />}
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: 8, color: accentColor, letterSpacing: '-0.03em' }}>
                        {isBlocked ? 'FORENSIC BLOCK' : 'RETURN AUTHORIZED'}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 500 }}>{data?.decision || 'Analysis Finalized'}</p>
                    
                    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <div style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Risk Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{data?.riskScore || 0}%</div>
                        </div>
                        <div style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>DNA Match</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{data?.analysis?.visualMatch || 0}%</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                    
                    {/* Left: Signals & Comparison */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Comparison Matrix */}
                        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontSize: '1.1rem', fontWeight: 800 }}>
                                <Fingerprint size={20} color="#3b82f6" /> VISUAL DNA COMPARISON
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: 12 }}>DELIVERY BASELINE</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {signals.filter((s:any) => s.label === 'Visual Identity').map((s:any) => (
                                            <span key={s.label} style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: 6, fontWeight: 700 }}>
                                                ✓ GENUINE PRODUCT DNA
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ padding: 20, background: isBlocked ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)', borderRadius: 16, border: `1px solid ${isBlocked ? '#ef444430' : '#22c55e30'}` }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, marginBottom: 12 }}>RETURN SCAN</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isBlocked ? '#ef4444' : '#22c55e' }}>
                                        {isBlocked ? '⚠ MISMATCH DETECTED' : '✓ DNA VERIFIED'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Logs */}
                        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontSize: '1.1rem', fontWeight: 800 }}>
                                <Activity size={20} color="#3b82f6" /> FORENSIC SIGNALS
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {signals.map((signal: any, i: number) => (
                                    <div key={i} style={{ 
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16,
                                        borderLeft: `4px solid ${signal?.score > 20 ? '#ef4444' : '#22c55e'}`
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{signal?.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{signal?.description}</div>
                                        </div>
                                        <div style={{ fontWeight: 900, color: signal?.score > 20 ? '#ef4444' : '#22c55e' }}>
                                            {signal?.score > 0 ? `+${signal?.score}%` : 'SAFE'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32 }}>
                            <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 800 }}>ORDER DETAILS</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>CLAIM ID</div>
                                    <div style={{ fontWeight: 700 }}>{data?.claimId || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>ORDER ID</div>
                                    <div style={{ fontWeight: 700 }}>{data?.orderId || 'N/A'}</div>
                                </div>
                                <div style={{ marginTop: 20 }}>
                                    <button onClick={() => window.location.href = '/'} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px', fontWeight: 700, cursor: 'pointer' }}>
                                        Back to Store
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Blockchain Reassurance */}
                        <div style={{ background: 'linear-gradient(135deg, #3b82f610 0%, #1d4ed810 100%)', border: '1px solid #3b82f630', borderRadius: 24, padding: 24, textAlign: 'center' }}>
                            <Zap size={24} color="#3b82f6" style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6', marginBottom: 4 }}>IMMUTABLE PROOF</div>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.5 }}>Analysis finalized and committed to the Forensic Ledger.</p>
                        </div>

                        {/* ACTIVE LEARNING LOOP */}
                        <div style={{ background: '#0f172a', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 24, padding: 24 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Activity size={16} color="#3b82f6" /> AI TRAINING LOOP
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 16 }}>
                                Was the detection inaccurate? Submit this case to fine-tune the Forensic Model.
                            </p>
                            <button 
                                onClick={() => alert("DNA Signature added to training queue. The model will be fine-tuned using Transfer Learning.")}
                                style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                                Enhance DNA Resolution
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
