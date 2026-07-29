'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../../../lib/api';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { LeadStatusBadge } from '../../../components/ui/badge';
import { formatCurrency } from '../../../lib/utils';
import { Plus, Home, Search, MapPin, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', page, search, status, type],
    queryFn: () => propertiesApi.list({ page, limit: 20, search: search || undefined, status: status || undefined, type: type || undefined }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });

  if (isLoading && !data) return <PageLoader />;
  const properties = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div>
      <Topbar
        title="Properties"
        subtitle={`${meta.total ?? 0} total properties`}
        actions={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Property
          </button>
        }
      />
      <div style={{ padding: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input className="crm-input" style={{ paddingLeft: '36px' }} placeholder="Search properties..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="crm-input" style={{ width: '150px' }} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              {['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OFFICE', 'SHOP'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="crm-input" style={{ width: '160px' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {['AVAILABLE', 'UNDER_CONSTRUCTION', 'SOLD', 'BLOCKED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {properties.map((p: any) => (
            <div key={p.id} className="glass-card" style={{ padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={20} color="#6366f1" />
                </div>
                <LeadStatusBadge label={p.status} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>{p.name}</h3>
              {p.projectName && <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{p.projectName}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                <MapPin size={11} /> {p.city}{p.locality && `, ${p.locality}`}
              </div>
              {(p.priceMin || p.priceMax) && (
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                  {p.priceMin && formatCurrency(p.priceMin)}{p.priceMax && p.priceMax !== p.priceMin && ` - ${formatCurrency(p.priceMax)}`}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {p.bedrooms && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>{p.bedrooms}BHK</span>}
                {p.carpetArea && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>{p.carpetArea} sqft</span>}
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>{p.type}</span>
              </div>
              <button
                onClick={() => { if (confirm('Delete property?')) deleteMutation.mutate(p.id); }}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '12px', padding: 0 }}
              >Delete</button>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
            <Home size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>No properties found</p>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={meta.page === 1} style={{ padding: '6px 12px' }}><ChevronLeft size={14} /></button>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{meta.page} / {meta.totalPages}</span>
            <button className="btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={meta.page === meta.totalPages} style={{ padding: '6px 12px' }}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
      {showCreate && <CreatePropertyModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreatePropertyModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', projectName: '', type: 'APARTMENT', status: 'AVAILABLE', city: '', locality: '', bedrooms: '', priceMin: '', priceMax: '' });
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data: any) => propertiesApi.create({
      ...data,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      priceMin: data.priceMin ? Number(data.priceMin) : undefined,
      priceMax: data.priceMax ? Number(data.priceMax) : undefined,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); onClose(); },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '480px', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Add Property</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Property Name*</label>
            <input className="crm-input" name="name" value={form.name} onChange={handle} placeholder="e.g. Oberoi Skyz 3BHK" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Type</label>
            <select className="crm-input" name="type" value={form.type} onChange={handle}>
              {['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OFFICE', 'SHOP'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Status</label>
            <select className="crm-input" name="status" value={form.status} onChange={handle}>
              {['AVAILABLE', 'UNDER_CONSTRUCTION', 'SOLD', 'BLOCKED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>City*</label>
            <input className="crm-input" name="city" value={form.city} onChange={handle} placeholder="Mumbai" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Locality</label>
            <input className="crm-input" name="locality" value={form.locality} onChange={handle} placeholder="Bandra" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Min Price (₹)</label>
            <input className="crm-input" name="priceMin" type="number" value={form.priceMin} onChange={handle} placeholder="5000000" />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Max Price (₹)</label>
            <input className="crm-input" name="priceMax" type="number" value={form.priceMax} onChange={handle} placeholder="7000000" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.name || !form.city}>
            {mutation.isPending ? 'Adding...' : 'Add Property'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
