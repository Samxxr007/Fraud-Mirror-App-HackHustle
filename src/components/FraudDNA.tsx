'use client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface FraudDNAProps {
  dna: {
    dnaId: string;
    patternId: string;
    label: string;
    patternFamily: string;
    lastSeen: string;
    matchScore: number;
    frequency: number;
    signals: { image: number; document: number; behaviour: number; carrier: number; network: number };
    description: string;
  };
}

function familyColor(family: string) {
  if (family === 'Legitimate') return '#22c55e';
  if (family.includes('Wardrobing')) return '#f59e0b';
  if (family.includes('INR')) return '#3b82f6';
  if (family.includes('Document')) return '#8b5cf6';
  if (family.includes('Organised')) return '#ef4444';
  return '#64748b';
}

export default function FraudDNA({ dna }: FraudDNAProps) {
  const color = familyColor(dna.patternFamily);
  const radarData = [
    { subject: 'Image', score: dna.signals.image },
    { subject: 'Document', score: dna.signals.document },
    { subject: 'Behaviour', score: dna.signals.behaviour },
    { subject: 'Carrier', score: dna.signals.carrier },
    { subject: 'Network', score: dna.signals.network },
  ];

  return (
    <div style={{
      background: 'rgba(15,23,42,0.8)',
      border: `1px solid ${color}40`,
      borderRadius: 14,
      padding: 20,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 12px 40px ${color}20`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace', marginBottom: 2 }}>{dna.patternId}</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>{dna.label}</div>
        </div>
        <div style={{
          background: `${color}20`, color, border: `1px solid ${color}40`,
          borderRadius: 99, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700,
        }}>{dna.patternFamily}</div>
      </div>

      <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>{dna.description}</p>

      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar name="Signal" dataKey="score" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: `1px solid ${color}40`, borderRadius: 8, fontSize: '0.75rem' }}
              formatter={(v: any) => [`${v}/100`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: '0.7rem', color: '#475569' }}>Last seen: {new Date(dna.lastSeen).toLocaleDateString()}</span>
        <span style={{ fontSize: '0.7rem', color: '#475569' }}>Seen {dna.frequency}x</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>Match: {dna.matchScore}%</span>
      </div>
    </div>
  );
}
