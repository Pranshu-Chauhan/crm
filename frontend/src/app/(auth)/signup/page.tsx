'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { setAuthData } from '../../../lib/auth';
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Building2, User, Check } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Agency Data
  const [agencyName, setAgencyName] = useState('');
  const [city, setCity] = useState('');
  const [agentsCount, setAgentsCount] = useState('');
  const [website, setWebsite] = useState('');

  // Step 2: Admin Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Success Data
  const [slug, setSlug] = useState('');
  const [redirectMsg, setRedirectMsg] = useState('Setting up your workspace...');

  const handleNext = () => {
    if (!agencyName || !city || !agentsCount) {
      setError('Please fill in all required agency details.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all user details.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Assuming registerAgency takes these params
      const res = await authApi.registerAgency({
        agencyName, city, agentCount: parseInt(agentsCount, 10) || 1, website,
        firstName, lastName, email, password
      });
      const { accessToken, user, tenant } = res.data;
      setAuthData(accessToken, user);
      
      setSlug(tenant?.slug || agencyName.toLowerCase().replace(/\s+/g, '-'));
      setStep(3);
      setLoading(false);

      setTimeout(() => setRedirectMsg('Creating your account...'), 1000);
      setTimeout(() => setRedirectMsg('Ready!'), 2000);
      setTimeout(() => router.push('/import'), 3000);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1629 50%, #0a0f1e 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '480px', animation: 'fadeInUp 0.5s ease', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>🏙️</div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>PropCRM</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9' }}>
            {step === 1 && 'Tell us about your agency'}
            {step === 2 && 'Create your admin account'}
            {step === 3 && 'Workspace Created!'}
          </h1>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          {step !== 3 && (
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'completed' : ''}`}>
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className={`step-line ${step >= 2 ? 'completed' : ''}`} />
              <div className={`step-dot ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                {step > 2 ? <Check size={16} /> : '2'}
              </div>
              <div className={`step-line ${step >= 3 ? 'completed' : ''}`} />
              <div className={`step-dot ${step === 3 ? 'completed' : ''}`}>3</div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Agency Name *</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                  <input className="crm-input" style={{ paddingLeft: '40px' }} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="e.g. Skyline Realtors" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>City *</label>
                <select className="crm-input" value={city} onChange={(e) => setCity(e.target.value)} style={{ appearance: 'none' }}>
                  <option value="" disabled>Select City</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Number of Agents *</label>
                <select className="crm-input" value={agentsCount} onChange={(e) => setAgentsCount(e.target.value)} style={{ appearance: 'none' }}>
                  <option value="" disabled>Select Team Size</option>
                  <option value="1-2">1-2</option>
                  <option value="3-5">3-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-25">11-25</option>
                  <option value="26-50">26-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Website (Optional)</label>
                <input className="crm-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.example.com" />
              </div>

              <button className="btn-primary" onClick={handleNext} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Next <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>First Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                    <input className="crm-input" style={{ paddingLeft: '40px' }} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Rahul" />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Last Name *</label>
                  <input className="crm-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sharma" />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Email Address *</label>
                <input className="crm-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@agency.com" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="crm-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Confirm Password *</label>
                <input className="crm-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn-secondary" onClick={handleBack} style={{ padding: '12px', flex: '0 0 auto' }}>
                  <ArrowLeft size={18} />
                </button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Creating...
                    </span>
                  ) : 'Create My CRM'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#22c55e' }}>
                <CheckCircle size={48} className="animate-checkmark" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Welcome to PropCRM, {firstName}!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your agency workspace has been successfully created.</p>
              
              <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '32px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Your CRM URL</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#818cf8' }}>propcrm.in/{slug}</p>
              </div>

              <div style={{ height: '4px', background: 'rgba(99,102,241,0.2)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', animation: 'progress 3s linear forwards' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', animation: 'pulse 1.5s infinite' }}>{redirectMsg}</p>
            </div>
          )}
        </div>

        {step !== 3 && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Already have an account? </span>
            <Link href="/login" style={{ color: '#818cf8', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>Sign in &rarr;</Link>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
