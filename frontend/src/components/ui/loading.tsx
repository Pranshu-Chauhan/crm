export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(99,102,241,0.2)`,
      borderTopColor: '#6366f1',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '400px',
      flexDirection: 'column', gap: '16px',
    }}>
      <LoadingSpinner size={40} />
      <p style={{ color: '#64748b', fontSize: '14px' }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: '#131929',
      border: '1px solid rgba(99,102,241,0.1)',
      borderRadius: '14px', padding: '20px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', marginBottom: '16px' }} />
      <div style={{ width: '60%', height: '28px', borderRadius: '6px', background: 'rgba(99,102,241,0.08)', marginBottom: '8px' }} />
      <div style={{ width: '80%', height: '14px', borderRadius: '4px', background: 'rgba(99,102,241,0.06)' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
