import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, BellRing, Building2, Globe, LayoutDashboard, Link2, LogIn, Phone, Smartphone, CheckCircle2, ChevronRight, Menu, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PropCRM — The CRM Built for Indian Real Estate',
  description: 'Manage leads, track pipelines, and close more deals. PropCRM is the all-in-one CRM platform for real estate agencies across India.',
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}>🏙️</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#f1f5f9' }}>
            PropCRM
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="hidden md:flex">
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Pricing</a>
          <a href="#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>About</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/login" className="hidden md:flex" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', alignItems: 'center', gap: '6px' }}>
            <LogIn size={16} /> Login
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: '8px 20px' }}>
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '160px 24px 80px', 
        position: 'relative',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '6px 16px', background: 'rgba(99,102,241,0.1)', 
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px',
            color: '#818cf8', fontSize: '13px', fontWeight: '600', marginBottom: '24px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', display: 'inline-block' }}></span>
            Now supporting MagicBricks & 99acres integration
          </div>
          
          <h1 style={{ 
            fontSize: '56px', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px',
            color: '#f1f5f9'
          }}>
            The CRM Built for <br />
            <span className="gradient-text">Indian Real Estate</span>
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Manage leads, track your pipeline, and close more deals. Designed specifically for the fast-paced Indian real estate market.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div style={{ 
          marginTop: '64px', width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 1,
          animation: 'fadeInUp 1s ease'
        }}>
          <div className="glass-card" style={{ padding: '8px', background: 'rgba(19, 25, 41, 0.7)' }}>
            <div style={{ 
              background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              aspectRatio: '16/9', display: 'flex', flexDirection: 'column'
            }}>
              {/* Fake window header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
              </div>
              {/* Fake dashboard body */}
              <div style={{ flex: 1, padding: '24px', display: 'flex', gap: '24px' }}>
                <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '80%' }}></div>
                  <div style={{ height: '24px', background: 'rgba(99,102,241,0.1)', borderRadius: '4px', width: '100%' }}></div>
                  <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '90%' }}></div>
                  <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '70%' }}></div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                    <div style={{ flex: 1, height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                    <div style={{ flex: 1, height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '40px 24px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'rgba(15,22,41,0.5)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
          Trusted by 200+ agencies across India
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.6 }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Mumbai</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Delhi NCR</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Bangalore</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Pune</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Hyderabad</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Everything you need to <span className="gradient-text">scale</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Built for brokers and agencies to streamline operations and close more property deals.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '20px' }}>
              <LayoutDashboard size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Lead Management</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>Capture leads directly from 99acres, MagicBricks, Facebook Ads, and your own website.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '20px' }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Pipeline Tracking</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>Visual Kanban pipeline to track deals from new inquiry to successful closure.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', marginBottom: '20px' }}>
              <BellRing size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Smart Notifications</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>Never miss a follow-up with instant WhatsApp and Email alerts for your team.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', marginBottom: '20px' }}>
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Mobile Ready</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>Progressive Web App lets your agents access leads and update status from the field.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', marginBottom: '20px' }}>
              <Link2 size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Webhook Integration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>Connect via APIs and webhooks to auto-capture leads from any custom source.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '20px' }}>
              <Building2 size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Multi-Agency Support</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>Complete tenant isolation. Manage multiple branches and broker teams securely.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 24px', background: 'var(--bg-secondary)', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Simple, transparent <span className="gradient-text">pricing</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              Start for free, then upgrade as your agency grows.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {/* Starter */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Starter</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800' }}>Free</span>
                <span style={{ color: 'var(--text-muted)' }}>/ 14 days</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                Perfect for independent brokers starting out.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Up to 2 Agents</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> 100 Active Leads</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Basic Pipeline</li>
              </ul>
              <Link href="/signup" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Start Trial</Link>
            </div>

            {/* Growth */}
            <div className="pricing-card popular" style={{ transform: 'scale(1.05)', zIndex: 2 }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Most Popular
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Growth</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800' }}>₹1,999</span>
                <span style={{ color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                For small agencies looking to scale fast.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Up to 5 Agents</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Unlimited Leads</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Portal Integrations</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> WhatsApp Alerts</li>
              </ul>
              <Link href="/signup" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
            </div>

            {/* Pro */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Pro</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800' }}>₹4,999</span>
                <span style={{ color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                Advanced tools for established teams.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Up to 15 Agents</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Team Performance</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Custom Webhooks</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Priority Support</li>
              </ul>
              <Link href="/signup" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
            </div>

            {/* Enterprise */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Enterprise</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800' }}>₹12,999</span>
                <span style={{ color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                Full power for large brokerages.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Unlimited Agents</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Custom Development</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> Dedicated Account Manager</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><CheckCircle2 size={16} color="#818cf8" /> White-label Options</li>
              </ul>
              <Link href="/signup" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '24px' }}>Ready to grow your agency?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '40px' }}>Join hundreds of top real estate professionals across India.</p>
          <Link href="/signup" className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏙️</div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>PropCRM</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            © {new Date().getFullYear()} PropCRM India. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
