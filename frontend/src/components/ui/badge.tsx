import { LEAD_STATUS_COLORS } from '../../lib/utils';

interface BadgeProps {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LeadStatusBadge({ label }: { label: string }) {
  return (
    <span
      className="status-badge"
      style={{
        background: getStatusBg(label),
        color: getStatusColor(label),
        border: `1px solid ${getStatusBorder(label)}`,
      }}
    >
      {label.replace('_', ' ')}
    </span>
  );
}

function getStatusBg(status: string): string {
  const map: Record<string, string> = {
    NEW: 'rgba(99,102,241,0.15)', CONTACTED: 'rgba(139,92,246,0.15)',
    SITE_VISIT: 'rgba(245,158,11,0.15)', NEGOTIATION: 'rgba(249,115,22,0.15)',
    BOOKED: 'rgba(6,182,212,0.15)', WON: 'rgba(16,185,129,0.15)',
    LOST: 'rgba(239,68,68,0.15)', UNQUALIFIED: 'rgba(100,116,139,0.15)',
    AVAILABLE: 'rgba(16,185,129,0.15)', UNDER_CONSTRUCTION: 'rgba(245,158,11,0.15)',
    SOLD: 'rgba(239,68,68,0.15)', BLOCKED: 'rgba(100,116,139,0.15)',
    LOW: 'rgba(100,116,139,0.15)', MEDIUM: 'rgba(245,158,11,0.15)',
    HIGH: 'rgba(249,115,22,0.15)', URGENT: 'rgba(239,68,68,0.15)',
    BUYER: 'rgba(99,102,241,0.15)', SELLER: 'rgba(139,92,246,0.15)',
    BUILDER: 'rgba(6,182,212,0.15)', INVESTOR: 'rgba(16,185,129,0.15)',
  };
  return map[status] || 'rgba(100,116,139,0.15)';
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: '#818cf8', CONTACTED: '#a78bfa',
    SITE_VISIT: '#fbbf24', NEGOTIATION: '#fb923c',
    BOOKED: '#22d3ee', WON: '#34d399',
    LOST: '#f87171', UNQUALIFIED: '#94a3b8',
    AVAILABLE: '#34d399', UNDER_CONSTRUCTION: '#fbbf24',
    SOLD: '#f87171', BLOCKED: '#94a3b8',
    LOW: '#94a3b8', MEDIUM: '#fbbf24',
    HIGH: '#fb923c', URGENT: '#f87171',
    BUYER: '#818cf8', SELLER: '#a78bfa',
    BUILDER: '#22d3ee', INVESTOR: '#34d399',
  };
  return map[status] || '#94a3b8';
}

function getStatusBorder(status: string): string {
  const map: Record<string, string> = {
    NEW: 'rgba(99,102,241,0.3)', CONTACTED: 'rgba(139,92,246,0.3)',
    SITE_VISIT: 'rgba(245,158,11,0.3)', NEGOTIATION: 'rgba(249,115,22,0.3)',
    BOOKED: 'rgba(6,182,212,0.3)', WON: 'rgba(16,185,129,0.3)',
    LOST: 'rgba(239,68,68,0.3)', UNQUALIFIED: 'rgba(100,116,139,0.3)',
    AVAILABLE: 'rgba(16,185,129,0.3)', UNDER_CONSTRUCTION: 'rgba(245,158,11,0.3)',
    SOLD: 'rgba(239,68,68,0.3)', BLOCKED: 'rgba(100,116,139,0.3)',
    LOW: 'rgba(100,116,139,0.3)', MEDIUM: 'rgba(245,158,11,0.3)',
    HIGH: 'rgba(249,115,22,0.3)', URGENT: 'rgba(239,68,68,0.3)',
    BUYER: 'rgba(99,102,241,0.3)', SELLER: 'rgba(139,92,246,0.3)',
    BUILDER: 'rgba(6,182,212,0.3)', INVESTOR: 'rgba(16,185,129,0.3)',
  };
  return map[status] || 'rgba(100,116,139,0.3)';
}
