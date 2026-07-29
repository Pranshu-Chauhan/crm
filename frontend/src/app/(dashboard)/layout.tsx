'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../../lib/auth';
import { Sidebar } from '../../components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '240px',
        minHeight: '100vh',
        background: '#0a0f1e',
        overflow: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
}
