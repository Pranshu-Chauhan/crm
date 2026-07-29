'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { leadsApi, usersApi } from '../../../lib/api';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { LeadStatusBadge } from '../../../components/ui/badge';
import { formatRelativeTime, getInitials, SOURCE_LABELS, BUDGET_LABELS } from '../../../lib/utils';
import {
  Plus, Search, Filter, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight, Users, Trash2, Eye,
  RotateCcw, Calendar, Download,
} from 'lucide-react';
import { HousingFetchModal } from '../../../components/ui/housing-fetch-modal';

const STATUSES = ['NEW', 'CONTACTED', 'SITE_VISIT', 'NEGOTIATION', 'BOOKED', 'WON', 'LOST', 'UNQUALIFIED'];
const SOURCES = ['HOUSING_COM', 'MAGIC_BRICKS', 'NINETY_NINE_ACRES', 'FACEBOOK', 'GOOGLE_ADS', 'REFERRAL', 'WALK_IN', 'WEBSITE', 'WHATSAPP', 'COLD_CALL', 'OTHER'];
const BUDGETS = ['BELOW_30L', 'RANGE_30_50L', 'RANGE_50_75L', 'RANGE_75L_1CR', 'RANGE_1_2CR', 'ABOVE_2CR'];
const PROPERTY_TYPES = ['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'OFFICE', 'SHOP'];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showHousingModal, setShowHousingModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, search, status, source, assignedToId],
    queryFn: () =>
      leadsApi.list({
        page,
        limit: 25,
        search: search || undefined,
        status: status || undefined,
        source: source || undefined,
        assignedToId: assignedToId || undefined,
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => leadsApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const resetFilters = () => {
    setSearch(''); setStatus(''); setSource(''); setAssignedToId(''); setPage(1);
  };

  const hasFilters = search || status || source || assignedToId;

  if (isLoading && !data) return <PageLoader />;
  const leads = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div>
      <Topbar
        title="Leads"
        subtitle={`${meta.total ?? 0} total leads`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowHousingModal(true)}
              title="Fetch leads from Housing.com"
            >
              <Download size={14} />
              Fetch from Housing.com
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
              style={{ position: 'relative' }}
            >
              <Filter size={14} />
              Filters
              {hasFilters && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#6366f1', fontSize: '9px', fontWeight: '700',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {[search, status, source, assignedToId].filter(Boolean).length}
                </span>
              )}
            </button>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> New Lead
            </button>
          </div>
        }
      />

      <div style={{ padding: '24px' }}>
        {/* Search & Filters */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                className="crm-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {showFilters && (
              <>
                <select className="crm-input" style={{ width: '160px' }} value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>

                <select className="crm-input" style={{ width: '160px' }} value={source}
                  onChange={(e) => { setSource(e.target.value); setPage(1); }}>
                  <option value="">All Sources</option>
                  {SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
                </select>

                <select className="crm-input" style={{ width: '160px' }} value={assignedToId}
                  onChange={(e) => { setAssignedToId(e.target.value); setPage(1); }}>
                  <option value="">All Agents</option>
                  {(users || []).map((u: any) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>

                {hasFilters && (
                  <button className="btn-secondary" onClick={resetFilters} style={{ flexShrink: 0 }}>
                    <RotateCcw size={12} /> Clear
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Leads Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Status</th>
                <th>Source</th>
                <th>Budget</th>
                <th>Location</th>
                <th>Assigned</th>
                <th>Follow-up</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => {
                const isOverdueFollowup = lead.followUpDate && new Date(lead.followUpDate) < new Date() && lead.status !== 'WON' && lead.status !== 'LOST';
                return (
                  <tr key={lead.id}>
                    {/* Lead Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '9px',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0,
                        }}>
                          {getInitials(lead.firstName, lead.lastName)}
                        </div>
                        <div>
                          <Link href={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px', cursor: 'pointer' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#f1f5f9')}>
                              {lead.firstName} {lead.lastName}
                            </div>
                          </Link>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Phone size={10} /> {lead.phone}
                            </span>
                            {lead.email && (
                              <span style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Mail size={10} /> {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status - clickable dropdown */}
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => updateMutation.mutate({ id: lead.id, status: e.target.value })}
                        style={{
                          background: 'transparent', border: 'none', outline: 'none',
                          cursor: 'pointer', fontSize: '11px', padding: 0,
                        }}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                      <div style={{ marginTop: '2px' }}>
                        <LeadStatusBadge label={lead.status} />
                      </div>
                    </td>

                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {SOURCE_LABELS[lead.source] || lead.source}
                    </td>

                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {lead.budgetRange ? BUDGET_LABELS[lead.budgetRange] : '—'}
                    </td>

                    <td>
                      {lead.preferredCity ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                          <MapPin size={11} />
                          {lead.preferredCity}
                          {lead.preferredLocality && <span style={{ color: '#475569' }}>, {lead.preferredLocality}</span>}
                        </div>
                      ) : <span style={{ color: '#475569' }}>—</span>}
                    </td>

                    <td>
                      {lead.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', fontWeight: '700', color: 'white',
                          }}>
                            {getInitials(lead.assignedTo.firstName, lead.assignedTo.lastName)}
                          </div>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {lead.assignedTo.firstName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#475569' }}>Unassigned</span>
                      )}
                    </td>

                    <td>
                      {lead.followUpDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: isOverdueFollowup ? '#f87171' : '#94a3b8' }}>
                          <Calendar size={11} />
                          {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          {isOverdueFollowup && <span style={{ color: '#f87171', fontWeight: '600', fontSize: '10px' }}>!</span>}
                        </div>
                      ) : <span style={{ color: '#475569', fontSize: '12px' }}>—</span>}
                    </td>

                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {formatRelativeTime(lead.createdAt)}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Link href={`/leads/${lead.id}`}>
                          <button
                            title="View lead"
                            style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Eye size={13} />
                          </button>
                        </Link>
                        <button
                          title="Delete lead"
                          onClick={() => { if (confirm(`Delete lead ${lead.firstName} ${lead.lastName}?`)) deleteMutation.mutate(lead.id); }}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {leads.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>No leads found</p>
              <p style={{ fontSize: '13px' }}>
                {hasFilters ? 'Try adjusting your filters' : 'Create your first lead or import from Housing.com'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Showing {leads.length} of {meta.total} leads
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={meta.page === 1} style={{ padding: '6px 12px' }}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ padding: '6px 12px', color: '#94a3b8', fontSize: '13px' }}>
                  {meta.page} / {meta.totalPages}
                </span>
                <button className="btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={meta.page === meta.totalPages} style={{ padding: '6px 12px' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateLeadModal onClose={() => setShowCreate(false)} users={users || []} />}
      {showHousingModal && <HousingFetchModal onClose={() => setShowHousingModal(false)} />}
    </div>
  );
}

function CreateLeadModal({ onClose, users }: { onClose: () => void; users: any[] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    source: 'OTHER', status: 'NEW',
    budgetRange: '', preferredCity: '', preferredLocality: '',
    preferredType: '', bedrooms: '', assignedToId: '',
    notes: '', followUpDate: '',
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data: any) => leadsApi.create({
      ...data,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      budgetRange: data.budgetRange || undefined,
      preferredType: data.preferredType || undefined,
      assignedToId: data.assignedToId || undefined,
      followUpDate: data.followUpDate || undefined,
      email: data.email || undefined,
      preferredCity: data.preferredCity || undefined,
      preferredLocality: data.preferredLocality || undefined,
      notes: data.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      onClose();
    },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>New Lead</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Add a new lead to your CRM</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        {/* Personal Info */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Contact Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>First Name *</label>
              <input className="crm-input" name="firstName" value={form.firstName} onChange={handle} placeholder="Raj" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Last Name *</label>
              <input className="crm-input" name="lastName" value={form.lastName} onChange={handle} placeholder="Sharma" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Phone *</label>
              <input className="crm-input" name="phone" value={form.phone} onChange={handle} placeholder="9876543210" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Email</label>
              <input className="crm-input" name="email" value={form.email} onChange={handle} placeholder="raj@example.com" />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Lead Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Source</label>
              <select className="crm-input" name="source" value={form.source} onChange={handle}>
                {Object.entries({ HOUSING_COM: 'Housing.com', MAGIC_BRICKS: 'MagicBricks', NINETY_NINE_ACRES: '99acres', FACEBOOK: 'Facebook', GOOGLE_ADS: 'Google Ads', REFERRAL: 'Referral', WALK_IN: 'Walk-in', WEBSITE: 'Website', WHATSAPP: 'WhatsApp', COLD_CALL: 'Cold Call', OTHER: 'Other' }).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Status</label>
              <select className="crm-input" name="status" value={form.status} onChange={handle}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Budget Range</label>
              <select className="crm-input" name="budgetRange" value={form.budgetRange} onChange={handle}>
                <option value="">Select budget</option>
                {Object.entries(BUDGET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Property Type</label>
              <select className="crm-input" name="preferredType" value={form.preferredType} onChange={handle}>
                <option value="">Any type</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Preferred City</label>
              <input className="crm-input" name="preferredCity" value={form.preferredCity} onChange={handle} placeholder="Mumbai" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Locality</label>
              <input className="crm-input" name="preferredLocality" value={form.preferredLocality} onChange={handle} placeholder="Bandra" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Bedrooms</label>
              <select className="crm-input" name="bedrooms" value={form.bedrooms} onChange={handle}>
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} BHK</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Assign To</label>
              <select className="crm-input" name="assignedToId" value={form.assignedToId} onChange={handle}>
                <option value="">Unassigned</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Follow-up Date</label>
            <input className="crm-input" name="followUpDate" type="date" value={form.followUpDate} onChange={handle} />
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Notes</label>
            <textarea className="crm-input" name="notes" value={form.notes} onChange={handle} rows={3} placeholder="Add initial notes about this lead..." style={{ resize: 'vertical' }} />
          </div>
        </div>

        {mutation.isError && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#f87171' }}>
            Failed to create lead. Please check the required fields.
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.firstName || !form.lastName || !form.phone}
          >
            {mutation.isPending ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
