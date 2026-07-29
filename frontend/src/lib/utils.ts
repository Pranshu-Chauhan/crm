import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONTACTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SITE_VISIT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  NEGOTIATION: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  BOOKED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  WON: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  LOST: 'bg-red-500/20 text-red-400 border-red-500/30',
  UNQUALIFIED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const SOURCE_LABELS: Record<string, string> = {
  HOUSING_COM: 'Housing.com',
  MAGIC_BRICKS: 'MagicBricks',
  NINETY_NINE_ACRES: '99acres',
  FACEBOOK: 'Facebook',
  GOOGLE_ADS: 'Google Ads',
  REFERRAL: 'Referral',
  WALK_IN: 'Walk-in',
  WEBSITE: 'Website',
  WHATSAPP: 'WhatsApp',
  COLD_CALL: 'Cold Call',
  OTHER: 'Other',
};

export const BUDGET_LABELS: Record<string, string> = {
  BELOW_30L: 'Below ₹30L',
  RANGE_30_50L: '₹30L – ₹50L',
  RANGE_50_75L: '₹50L – ₹75L',
  RANGE_75L_1CR: '₹75L – ₹1Cr',
  RANGE_1_2CR: '₹1Cr – ₹2Cr',
  ABOVE_2CR: 'Above ₹2Cr',
};

export const DEAL_STAGES = [
  { key: 'NEW', label: 'New', color: 'bg-slate-500' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-blue-500' },
  { key: 'SITE_VISIT', label: 'Site Visit', color: 'bg-purple-500' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-500' },
  { key: 'BOOKED', label: 'Booked', color: 'bg-cyan-500' },
  { key: 'WON', label: 'Won', color: 'bg-emerald-500' },
  { key: 'LOST', label: 'Lost', color: 'bg-red-500' },
];
