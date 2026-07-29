'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearAuthData, type User } from '../../lib/auth';
import { getInitials } from '../../lib/utils';
import {
  LayoutDashboard, Users, Building2, Home, TrendingUp,
  CheckSquare, LogOut, Settings, Building, Activity, Download,
  BarChart3, UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/contacts', icon: Building2, label: 'Contacts' },
  { href: '/properties', icon: Home, label: 'Properties' },
  { href: '/pipeline', icon: TrendingUp, label: 'Pipeline' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/import', icon: Download, label: 'Housing.com Leads' },
];

const BOTTOM_NAV_ITEMS = [
  { href: '/users', icon: UserCircle, label: 'Team' },
];


export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Read localStorage only after hydration to prevent SSR/client mismatch.
  // On the server getStoredUser() returns null (window is undefined), so we
  // defer the read to useEffect which only runs on the client.
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1425 100%)',
      borderRight: '1px solid rgba(99,102,241,0.12)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 10px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}>🏙️</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>Skyline</div>
            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '500' }}>CRM Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px' }}>
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              style={{ marginBottom: '2px' }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav (Team) */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '8px', marginTop: '8px' }}>
          Admin
        </div>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              style={{ marginBottom: '2px' }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User section */}
      {user && (
        <div style={{
          borderTop: '1px solid rgba(99,102,241,0.1)',
          paddingTop: '16px',
          marginTop: '8px',
        }}>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '8px',
            background: 'rgba(99,102,241,0.06)', marginBottom: '8px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0,
            }}>
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '500' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-item"
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
