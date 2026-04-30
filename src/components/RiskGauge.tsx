'use client';
import { useEffect, useRef } from 'react';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

function getColor(score: number) {
  if (score <= 30) return { stroke: '#22c55e', text: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Low Risk' };
  if (score <= 70) return { stroke: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium Risk' };
  return { stroke: '#ef4444', text: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'High Risk' };
}

export default function RiskGauge({ score, size = 'lg', animated = true }: RiskGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const colors = getColor(score);

  const dimensions = { sm: 80, md: 120, lg: 180 };
  const dim = dimensions[size];
  const radius = dim * 0.38;
  const circumference = 2 * Math.PI * radius;
  const cx = dim / 2;
  const cy = dim / 2;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    const timer = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)';
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [score, animated, circumference, offset]);

  const fontSize = size === 'lg' ? '2.5rem' : size === 'md' ? '1.6rem' : '1rem';
  const labelSize = size === 'lg' ? '0.8rem' : '0.65rem';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={dim} height={dim} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          style={{ filter: `drop-shadow(0 0 8px ${colors.stroke}80)` }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize, fontWeight: 800, color: colors.text, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: labelSize, color: colors.text, opacity: 0.8, marginTop: 2, fontWeight: 600 }}>{colors.label}</span>
      </div>
    </div>
  );
}
