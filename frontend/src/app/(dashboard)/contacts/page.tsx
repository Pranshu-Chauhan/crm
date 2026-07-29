'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../../lib/api';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { LeadStatusBadge } from '../../../components/ui/badge';
import { getInitials, formatRelativeTime } from '../../../lib/utils';
import { Plus, Search, Phone, Mail, MapPin, Trash2, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', page, search, type],
    queryFn: () => contactsApi.list({ page, limit: 20, search: search || undefined, type: type || undefined }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  if (isLoading && !data) return <PageLoader />;
  const contacts = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div>
      <Topbar
        title="Contacts"
        subtitle={`${meta.total ?? 0} contacts`}
        actions={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Contact
          </button>
        }
      />
      <div style={{ padding: '24px' }}>
        <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input className="crm-input" style={{ paddingLeft: '36px' }} placeholder="Search contacts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="crm-input" style={{ width: '150px' }} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              {['BUYER', 'SELLER', 'BUILDER', 'INVESTOR', 'OTHER'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                        {getInitials(c.firstName, c.lastName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px' }}>{c.firstName} {c.lastName}</div>
                        {c.company && <div style={{ fontSize: '11px', color: '#475569' }}>{c.company}</div>}
                      </div>
                    </div>
                  </td>
                  <td><LeadStatusBadge label={c.type} /></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#94a3b8' }}><Phone size={11} /> {c.phone}</div></td>
                  <td style={{ fontSize: '13px', color: '#94a3b8' }}>{c.email || '—'}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#94a3b8' }}>{c.city && <><MapPin size={11} />{c.city}</>}</div></td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{formatRelativeTime(c.createdAt)}</td>
                  <td>
                    <button onClick={() => { if (confirm('Delete contact?')) deleteMutation.mutate(c.id); }} style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && (<div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}><Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} /><p>No contacts found</p></div>)}
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{meta.total} contacts</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={meta.page === 1} style={{ padding: '6px 12px' }}><ChevronLeft size={14} /></button>
                <span style={{ padding: '6px 12px', color: '#94a3b8', fontSize: '13px' }}>{meta.page} / {meta.totalPages}</span>
                <button className="btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={meta.page === meta.totalPages} style={{ padding: '6px 12px' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showCreate && <CreateContactModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateContactModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', type: 'BUYER', city: '', company: '' });
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const mutation = useMutation({
    mutationFn: (data: any) => contactsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contacts'] }); onClose(); },
  });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '440px', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Add Contact</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[{ name: 'firstName', label: 'First Name*' }, { name: 'lastName', label: 'Last Name*' }, { name: 'phone', label: 'Phone*' }, { name: 'email', label: 'Email' }, { name: 'company', label: 'Company' }, { name: 'city', label: 'City' }].map(({ name, label }) => (
            <div key={name}>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>{label}</label>
              <input className="crm-input" name={name} value={(form as any)[name]} onChange={handle} />
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Type</label>
            <select className="crm-input" name="type" value={form.type} onChange={handle}>
              {['BUYER', 'SELLER', 'BUILDER', 'INVESTOR', 'OTHER'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.firstName || !form.phone}>
            {mutation.isPending ? 'Adding...' : 'Add Contact'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
