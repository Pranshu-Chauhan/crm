import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'indigo' | 'purple' | 'emerald' | 'amber' | 'red' | 'cyan';
  subtitle?: string;
}

const colorMap = {
  indigo: { bg: 'rgba(99,102,241,0.12)', icon: '#6366f1', border: 'rgba(99,102,241,0.2)', glow: '0 0 20px rgba(99,102,241,0.12)' },
  purple: { bg: 'rgba(139,92,246,0.12)', icon: '#8b5cf6', border: 'rgba(139,92,246,0.2)', glow: '0 0 20px rgba(139,92,246,0.12)' },
  emerald: { bg: 'rgba(16,185,129,0.12)', icon: '#10b981', border: 'rgba(16,185,129,0.2)', glow: '0 0 20px rgba(16,185,129,0.12)' },
  amber: { bg: 'rgba(245,158,11,0.12)', icon: '#f59e0b', border: 'rgba(245,158,11,0.2)', glow: '0 0 20px rgba(245,158,11,0.12)' },
  red: { bg: 'rgba(239,68,68,0.12)', icon: '#ef4444', border: 'rgba(239,68,68,0.2)', glow: '0 0 20px rgba(239,68,68,0.12)' },
  cyan: { bg: 'rgba(6,182,212,0.12)', icon: '#06b6d4', border: 'rgba(6,182,212,0.2)', glow: '0 0 20px rgba(6,182,212,0.12)' },
};

export function StatCard({ title, value, change, icon: Icon, color = 'indigo', subtitle }: StatCardProps) {
  const c = colorMap[color];
  const isPositive = (change ?? 0) >= 0;

  return (
    <div
      className="kpi-card"
      style={{
        background: '#131929',
        border: `1px solid ${c.border}`,
        borderRadius: '14px',
        padding: '20px',
        boxShadow: c.glow,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: c.bg, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={c.icon} />
        </div>
        {change !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: '600',
            color: isPositive ? '#10b981' : '#ef4444',
            background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '20px', padding: '3px 8px',
          }}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#f1f5f9', lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );
}
