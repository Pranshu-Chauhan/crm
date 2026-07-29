'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1629 50%, #0a0f1e 100%)',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏙️</div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>PropCRM</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          {!success ? (
            <>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>Reset password</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Enter your email address and we'll send you a link to reset your password.</p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', marginBottom: '24px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                    <input type="email" required className="crm-input" style={{ paddingLeft: '40px' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.com" />
                  </div>
                </div>

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '24px' }}>
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#818cf8' }}>
                <Mail size={32} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Check your email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>We've sent a password reset link to <br /><span style={{ color: '#f1f5f9', fontWeight: '500' }}>{email}</span></p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              <ArrowLeft size={16} /> Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
