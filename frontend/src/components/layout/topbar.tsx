'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getStoredUser, type User } from '../../lib/auth';
import { getInitials } from '../../lib/utils';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  // Defer localStorage read to after hydration — reading it during SSR returns
  // null (window is undefined), so doing it inline causes a server/client mismatch.
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header style={{
      height: '64px',
      background: 'rgba(10, 15, 30, 0.9)',
      borderBottom: '1px solid rgba(99,102,241,0.1)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px 0 24px',
      gap: '16px',
      backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>{subtitle}</p>}
      </div>

      {/* Actions */}
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{actions}</div>}

      {/* Notification Bell */}
      <button style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', cursor: 'pointer',
        position: 'relative',
      }}>
        <Bell size={16} />
        <span style={{
          position: 'absolute', top: '6px', right: '6px',
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#6366f1',
        }} />
      </button>

      {/* Avatar */}
      {user && (
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '700', color: 'white',
          cursor: 'pointer',
        }}>
          {user ? getInitials(user.firstName, user.lastName) : 'U'}
        </div>
      )}
    </header>
  );
}

// Note: getInitials imported from auth.ts which needs to also export it
