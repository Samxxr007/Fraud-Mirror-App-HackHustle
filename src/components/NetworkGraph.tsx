'use client';
import { useEffect, useRef } from 'react';

const RETAILERS = [
  { id: 'A', name: 'Retailer A', x: 250, y: 150, active: true },
  { id: 'B', name: 'Retailer B', x: 500, y: 80, active: false },
  { id: 'C', name: 'Retailer C', x: 700, y: 200, active: true },
  { id: 'D', name: 'Retailer D', x: 600, y: 380, active: false },
  { id: 'E', name: 'Retailer E', x: 320, y: 350, active: true },
];

const EDGES = [
  { from: 'A', to: 'B', label: '3 shared signals' },
  { from: 'A', to: 'C', label: '7 shared signals', strong: true },
  { from: 'B', to: 'D', label: '2 shared signals' },
  { from: 'C', to: 'D', label: '5 shared signals', strong: true },
  { from: 'D', to: 'E', label: '4 shared signals' },
  { from: 'A', to: 'E', label: '6 shared signals', strong: true },
];

export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw edges
      EDGES.forEach((edge) => {
        const from = RETAILERS.find((r) => r.id === edge.from)!;
        const to = RETAILERS.find((r) => r.id === edge.to)!;
        const bothActive = from.active && to.active;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = bothActive
          ? `rgba(239,68,68,${0.4 + 0.2 * Math.sin(t * 0.05)})`
          : edge.strong ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = bothActive ? 2 : 1;
        ctx.setLineDash(bothActive ? [6, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Edge label
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        ctx.fillStyle = 'rgba(100,116,139,0.8)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, mx, my - 6);
      });

      // Draw nodes
      RETAILERS.forEach((r) => {
        const pulse = r.active ? 4 * Math.abs(Math.sin(t * 0.06)) : 0;
        const radius = 28 + pulse;

        // Glow
        if (r.active) {
          const grd = ctx.createRadialGradient(r.x, r.y, radius * 0.5, r.x, r.y, radius * 2.5);
          grd.addColorStop(0, `rgba(239,68,68,${0.2 + 0.1 * Math.sin(t * 0.06)})`);
          grd.addColorStop(1, 'rgba(239,68,68,0)');
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Circle
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = r.active ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.15)';
        ctx.strokeStyle = r.active ? `rgba(239,68,68,${0.7 + 0.2 * Math.sin(t * 0.06)})` : 'rgba(59,130,246,0.4)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = r.active ? '#fca5a5' : '#93c5fd';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(r.name, r.x, r.y + 4);
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={480}
      style={{ width: '100%', height: 'auto', borderRadius: 12, background: 'rgba(0,0,0,0.3)' }}
    />
  );
}
