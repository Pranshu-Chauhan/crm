'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { setAuthData } from '../../../lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { accessToken, user } = res.data;
      setAuthData(accessToken, user);
      router.push('/import');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1629 50%, #0a0f1e 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '16px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>🏙️</div>
          <h1 style={{
            fontSize: '28px', fontWeight: '800', color: '#f1f5f9',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>PropCRM</h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '14px' }}>
            Real Estate Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>
            Welcome back
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
            Sign in to your account
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', borderRadius: '8px',
              padding: '12px 16px', fontSize: '14px', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                className="crm-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@agency.com"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                className="crm-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', fontWeight: '600' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Don't have an account? </span>
            <Link href="/signup" style={{ color: '#818cf8', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              Start free trial &rarr;
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
