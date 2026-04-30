'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import ROICalculator from '../../components/ROICalculator';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];
const thirtyDayData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  blocked: Math.floor(40000 + i * 1200),
  approved: Math.floor(300000 + i * 3000),
}));
const fraudTypeData = [
  { name: 'Wardrobing', value: 34 },
  { name: 'INR Abuse', value: 28 },
  { name: 'Document Fraud', value: 19 },
  { name: 'Friendly Fraud', value: 12 },
  { name: 'Other', value: 7 },
];
const reviewTimeBefore = [
  { label: 'Manual Review', before: 28, after: 4 },
  { label: 'Decision Time', before: 18, after: 1 },
  { label: 'Agent Hrs/Day', before: 12, after: 2 },
];
const autoDecisionTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  rate: 55 + i * 3,
}));

const MetricCard = ({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: string }) => (
  <div style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 14, padding: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 6 }}>{sub}</div>
      </div>
      <span style={{ fontSize: '1.8rem' }}>{icon}</span>
    </div>
  </div>
);

export default function EconomicsPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 16px 60px', background: '#030712' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>Fraud Economic Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time ROI metrics — the financial impact of fraud prevention</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 32 }}>
          <MetricCard label="Fraud Blocked Today" value="₹4.15L" sub="+18% vs yesterday" color="#ef4444" icon="🛡️" />
          <MetricCard label="Auto-Approve Rate" value="84%" sub="of all claims" color="#22c55e" icon="⚡" />
          <MetricCard label="Review Hours Saved" value="34h" sub="this week" color="#3b82f6" icon="⏱️" />
          <MetricCard label="False Positive Rate" value="3.2%" sub="below 5% target" color="#f59e0b" icon="🎯" />
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>30-Day Fraud Blocked vs Approved (₹)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={thirtyDayData}>
                <XAxis dataKey="day" tick={{ fill: '#334155', fontSize: 9 }} axisLine={false} tickLine={false} interval={5} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                <Bar dataKey="approved" name="Approved" stackId="a" fill="#22c55e" />
                <Bar dataKey="blocked" name="Blocked" stackId="a" fill="#ef4444" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Fraud Type Breakdown</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={fraudTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {fraudTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {fraudTypeData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS[i] }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 32 }}>
          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Auto-Decision Rate Trend (12 Months)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={autoDecisionTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 100]} unit="%" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} formatter={(v: any) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', marginBottom: 16 }}>Review Time: Before vs After Fraud Mirror</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={reviewTimeBefore} layout="vertical">
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} unit="min" />
                <YAxis type="category" dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={95} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} formatter={(v: any) => `${v} min`} />
                <Bar dataKey="before" name="Before" fill="rgba(239,68,68,0.6)" radius={[0,4,4,0]} />
                <Bar dataKey="after" name="After" fill="rgba(34,197,94,0.7)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>💰 ROI Calculator</h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 24 }}>Adjust sliders to estimate your savings — updates in real time.</p>
          <ROICalculator />
        </div>
      </div>
    </div>
  );
}
