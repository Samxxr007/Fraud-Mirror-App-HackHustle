'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import claimsData from '../../data/claims.json';
import customersData from '../../data/customers.json';
import fraudDNA from '../../data/fraud-dna.json';
import FraudDNA from '../../components/FraudDNA';
import RiskGauge from '../../components/RiskGauge';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

const dailyData = [
  { day: 'Mon', blocked: 42000, approved: 380000, reviewed: 28000 },
  { day: 'Tue', blocked: 67000, approved: 420000, reviewed: 35000 },
  { day: 'Wed', blocked: 38000, approved: 510000, reviewed: 22000 },
  { day: 'Thu', blocked: 91000, approved: 390000, reviewed: 45000 },
  { day: 'Fri', blocked: 55000, approved: 480000, reviewed: 31000 },
  { day: 'Sat', blocked: 78000, approved: 620000, reviewed: 40000 },
  { day: 'Sun', blocked: 44000, approved: 350000, reviewed: 18000 },
];

const fraudTypeData = [
  { name: 'Wardrobing', value: 34 },
  { name: 'INR Abuse', value: 28 },
  { name: 'Doc Fraud', value: 19 },
  { name: 'Friendly Fraud', value: 12 },
  { name: 'Other', value: 7 },
];

const autoDecisionTrend = [
  { week: 'W1', rate: 71 }, { week: 'W2', rate: 74 }, { week: 'W3', rate: 76 },
  { week: 'W4', rate: 79 }, { week: 'W5', rate: 81 }, { week: 'W6', rate: 84 },
];

const denied = claimsData.filter(c => c.decision === 'deny').length;
const approved = claimsData.filter(c => c.decision === 'approve').length;
const reviewed = claimsData.filter(c => c.decision === 'review').length;

const TABS = ['Overview', 'Claims', 'Fraud DNA', 'Customers'];

export default function DashboardPage() {
  const [tab, setTab] = useState('Overview');
  const [decisionFilter, setDecisionFilter] = useState('all');

  const filteredClaims = decisionFilter === 'all'
    ? claimsData
    : claimsData.filter(c => c.decision === decisionFilter);

  const MetricCard = ({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) => (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}25`,
      borderRadius: 14, padding: '18px 20px',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '0 0 60px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Page header */}
        <div style={{ padding: '32px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: 4 }}>
                Fraud Ops Dashboard
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Real-time fraud signal monitoring — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/economics" className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>ROI Dashboard →</Link>
              <Link href="/network" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Network Map →</Link>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <MetricCard label="Fraud Blocked Today" value="₹4.15L" sub="+18% vs yesterday" color="#ef4444" icon="🛡️" />
          <MetricCard label="Auto-Approve Rate" value="62%" sub="of all claims" color="#22c55e" icon="⚡" />
          <MetricCard label="Review Hours Saved" value="34h" sub="this week" color="#3b82f6" icon="⏱️" />
          <MetricCard label="False Positive Rate" value="3.2%" sub="well below 5% target" color="#f59e0b" icon="🎯" />
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div>
            <div className="grid-2" style={{ marginBottom: 24 }}>
              {/* Bar chart */}
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>7-Day Fraud Blocked vs Approved (₹)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData}>
                    <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                    <Bar dataKey="blocked" name="Blocked" fill="#ef4444" radius={[4,4,0,0]} />
                    <Bar dataKey="reviewed" name="Reviewed" fill="#f59e0b" radius={[4,4,0,0]} />
                    <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Fraud type donut */}
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Fraud Type Breakdown</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={fraudTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {fraudTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {fraudTypeData.map((d, i) => (
                      <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: COLORS[i] }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-decision trend */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Auto-Decision Rate Trend (6 Weeks)</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={autoDecisionTrend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 90]} unit="%" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} formatter={(v: any) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="grid-3">
              {[
                { label: 'Total Claims Analysed', value: claimsData.length, color: '#3b82f6' },
                { label: 'Auto-Denied', value: denied, color: '#ef4444' },
                { label: 'Auto-Approved', value: approved, color: '#22c55e' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: 20, textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLAIMS ── */}
        {tab === 'Claims' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', 'approve', 'review', 'deny'].map(f => (
                <button key={f} onClick={() => setDecisionFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: decisionFilter === f ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                  color: decisionFilter === f ? 'white' : '#64748b',
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${claimsData.length})` : `(${claimsData.filter(c=>c.decision===f).length})`}
                </button>
              ))}
            </div>
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Score</th>
                    <th>Decision</th>
                    <th>Ring</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map(claim => (
                    <tr key={claim.claimId}>
                      <td><span style={{ fontFamily: 'monospace', color: '#93c5fd', fontSize: '0.8rem' }}>{claim.claimId}</span></td>
                      <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{claim.claimType.replace('_', ' ')}</td>
                      <td style={{ fontSize: '0.8rem' }}>{claim.customerId}</td>
                      <td>
                        <span style={{
                          fontWeight: 800,
                          color: claim.totalScore <= 30 ? '#22c55e' : claim.totalScore <= 70 ? '#f59e0b' : '#ef4444',
                        }}>{claim.totalScore}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${claim.decision === 'approve' ? 'green' : claim.decision === 'deny' ? 'red' : 'amber'}`} style={{ fontSize: '0.62rem' }}>
                          {claim.decision.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: claim.ringId ? '#fca5a5' : '#334155' }}>
                        {claim.ringId ? `🔗 ${claim.ringId}` : '—'}
                      </td>
                      <td>
                        <Link href={`/mirror/${claim.claimId}`} style={{ color: '#3b82f6', fontSize: '0.78rem', textDecoration: 'none' }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FRAUD DNA ── */}
        {tab === 'Fraud DNA' && (
          <div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 20 }}>
              Each fraud attempt generates a unique signal fingerprint. These are the 10 known patterns in our database.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {fraudDNA.map(dna => <FraudDNA key={dna.dnaId} dna={dna} />)}
            </div>
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === 'Customers' && (
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Trust Score</th>
                  <th>Return Rate</th>
                  <th>Fraud Flags</th>
                  <th>Tier</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customersData.map(c => (
                  <tr key={c.customerId}>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>{c.customerId}</div>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 800,
                        color: c.trustScore >= 80 ? '#22c55e' : c.trustScore >= 50 ? '#3b82f6' : c.trustScore >= 20 ? '#f59e0b' : '#ef4444',
                      }}>{c.trustScore}</span>
                    </td>
                    <td style={{ color: c.returnRate > 0.3 ? '#ef4444' : '#94a3b8' }}>
                      {Math.round(c.returnRate * 100)}%
                    </td>
                    <td>
                      {c.priorFraudFlags > 0
                        ? <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>{c.priorFraudFlags} flags</span>
                        : <span style={{ color: '#334155', fontSize: '0.78rem' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: c.tier === 'Trusted' ? 'rgba(34,197,94,0.15)' : c.tier === 'Good Standing' ? 'rgba(59,130,246,0.15)' : c.tier === 'At Risk' ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.1)',
                        color: c.tier === 'Trusted' ? '#22c55e' : c.tier === 'Good Standing' ? '#93c5fd' : c.tier === 'At Risk' ? '#fca5a5' : '#94a3b8',
                      }}>{c.tier}</span>
                    </td>
                    <td>
                      <Link href={`/trust/${c.customerId}`} style={{ color: '#3b82f6', fontSize: '0.78rem', textDecoration: 'none' }}>
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
