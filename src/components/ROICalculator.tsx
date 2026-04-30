'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ROICalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState(5000);
  const [avgValue, setAvgValue] = useState(2500);
  const [fraudRate, setFraudRate] = useState(3);

  const fraudulentClaims = Math.round(monthlyVolume * (fraudRate / 100));
  const detectionRate = 0.87; // 87% catch rate
  const falsePositiveRate = 0.04;
  const reviewTimeSaved = 12; // minutes per claim

  const monthlySavings = Math.round(fraudulentClaims * detectionRate * avgValue);
  const hoursSaved = Math.round((monthlyVolume * falsePositiveRate * reviewTimeSaved) / 60 * 10) / 10;
  const annualROI = monthlySavings * 12;

  const barData = [
    { month: 'Jan', blocked: 180000, approved: 2100000 },
    { month: 'Feb', blocked: 210000, approved: 1980000 },
    { month: 'Mar', blocked: 195000, approved: 2250000 },
    { month: 'Apr', blocked: monthlySavings, approved: monthlyVolume * avgValue * 0.97 },
  ];

  const SliderInput = ({
    label, value, min, max, step, onChange, format,
  }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format: (v: number) => string;
  }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6' }}>{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: '0.65rem', color: '#475569' }}>{format(min)}</span>
        <span style={{ fontSize: '0.65rem', color: '#475569' }}>{format(max)}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      {/* Left — Inputs */}
      <div style={{
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16, padding: 24,
      }}>
        <h3 style={{ color: '#93c5fd', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
          ⚙️ Your Business Parameters
        </h3>
        <SliderInput
          label="Monthly Return Volume" value={monthlyVolume} min={100} max={50000} step={100}
          onChange={setMonthlyVolume} format={(v) => v.toLocaleString() + ' returns'}
        />
        <SliderInput
          label="Average Return Value" value={avgValue} min={200} max={20000} step={100}
          onChange={setAvgValue} format={(v) => '₹' + v.toLocaleString()}
        />
        <SliderInput
          label="Estimated Fraud Rate" value={fraudRate} min={0.5} max={20} step={0.5}
          onChange={setFraudRate} format={(v) => v + '%'}
        />

        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 10, padding: '12px 16px', marginTop: 8,
        }}>
          <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 4 }}>Estimated fraudulent claims/month</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{fraudulentClaims.toLocaleString()}</div>
        </div>
      </div>

      {/* Right — Outputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Monthly Fraud Savings', value: `₹${monthlySavings.toLocaleString()}`, color: '#22c55e', icon: '💰' },
          { label: 'Review Hours Saved / Month', value: `${hoursSaved} hrs`, color: '#3b82f6', icon: '⏱️' },
          { label: 'Annual ROI', value: `₹${(annualROI / 100000).toFixed(1)}L`, color: '#f59e0b', icon: '📈' },
        ].map((metric) => (
          <div key={metric.label} style={{
            background: `${metric.color}10`,
            border: `1px solid ${metric.color}30`,
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2 }}>{metric.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: metric.color }}>{metric.value}</div>
            </div>
            <span style={{ fontSize: '2rem' }}>{metric.icon}</span>
          </div>
        ))}

        <div style={{
          background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12, padding: '16px', height: 140,
        }}>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Blocked vs Approved (Monthly)
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }}
                formatter={(v: any) => `₹${Number(v).toLocaleString()}`}
              />
              <Bar dataKey="blocked" name="Blocked" fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
