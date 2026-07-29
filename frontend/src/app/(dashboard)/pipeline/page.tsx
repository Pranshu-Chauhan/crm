'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../../../lib/api';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { formatCurrency, DEAL_STAGES } from '../../../lib/utils';
import { Plus, TrendingUp } from 'lucide-react';

export default function PipelinePage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: pipeline, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => dealsApi.pipeline().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => dealsApi.update(id, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipeline'] }),
  });

  if (isLoading) return <PageLoader />;

  const totalDeals = Object.values(pipeline || {}).flat().length;
  const totalValue = Object.values(pipeline || {}).flat().reduce((sum: number, d: any) => sum + (d.value || 0), 0);

  return (
    <div>
      <Topbar
        title="Deal Pipeline"
        subtitle={`${totalDeals} deals · ${formatCurrency(totalValue)} total value`}
        actions={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Deal
          </button>
        }
      />

      <div style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '14px', minWidth: 'max-content' }}>
          {DEAL_STAGES.map((stage) => {
            const deals = (pipeline?.[stage.key] || []) as any[];
            const stageValue = deals.reduce((s: number, d: any) => s + (d.value || 0), 0);

            return (
              <div
                key={stage.key}
                style={{
                  width: '260px', minHeight: '100px',
                  background: '#0f1629',
                  border: '1px solid rgba(99,102,241,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(99,102,241,0.08)',
                  background: 'rgba(99,102,241,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getDotColor(stage.key) }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{stage.label}</span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', color: '#94a3b8',
                      background: 'rgba(99,102,241,0.1)',
                      padding: '2px 8px', borderRadius: '10px',
                    }}>{deals.length}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{formatCurrency(stageValue)}</div>
                </div>

                {/* Cards */}
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {deals.map((deal: any) => (
                    <div
                      key={deal.id}
                      className="pipeline-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9', flex: 1 }}>{deal.title}</div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#34d399', marginLeft: '8px', flexShrink: 0 }}>
                          {deal.value ? formatCurrency(deal.value) : '—'}
                        </div>
                      </div>

                      {deal.lead && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                          👤 {deal.lead.firstName} {deal.lead.lastName}
                        </div>
                      )}

                      {deal.property && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                          🏠 {deal.property.name}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {DEAL_STAGES
                          .filter((s) => s.key !== stage.key)
                          .slice(0, 3)
                          .map((s) => (
                            <button
                              key={s.key}
                              onClick={() => updateMutation.mutate({ id: deal.id, stage: s.key })}
                              style={{
                                fontSize: '9px', padding: '2px 6px',
                                borderRadius: '4px', border: '1px solid rgba(99,102,241,0.2)',
                                background: 'rgba(99,102,241,0.05)',
                                color: '#818cf8', cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              → {s.label}
                            </button>
                          ))}
                      </div>

                      {deal.probability !== null && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(99,102,241,0.1)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '2px',
                              background: getProbabilityColor(deal.probability),
                              width: `${deal.probability}%`,
                              transition: 'width 0.3s',
                            }} />
                          </div>
                          <div style={{ fontSize: '9px', color: '#475569', marginTop: '3px' }}>{deal.probability}% probability</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {deals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: '12px' }}>
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && <CreateDealModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function getDotColor(stage: string): string {
  const map: Record<string, string> = {
    NEW: '#64748b', CONTACTED: '#6366f1', SITE_VISIT: '#8b5cf6',
    NEGOTIATION: '#f59e0b', BOOKED: '#06b6d4', WON: '#10b981', LOST: '#ef4444',
  };
  return map[stage] || '#64748b';
}

function getProbabilityColor(prob: number): string {
  if (prob >= 75) return '#10b981';
  if (prob >= 50) return '#f59e0b';
  if (prob >= 25) return '#f97316';
  return '#ef4444';
}

function CreateDealModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', stage: 'NEW', value: '', probability: '10', notes: '' });
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data: any) => dealsApi.create({ ...data, value: data.value ? Number(data.value) : undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pipeline'] }); onClose(); },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '440px', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Create Deal</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Title*</label>
            <input className="crm-input" name="title" value={form.title} onChange={handle} placeholder="Deal title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Stage</label>
              <select className="crm-input" name="stage" value={form.stage} onChange={handle}>
                {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Deal Value (₹)</label>
              <input className="crm-input" name="value" type="number" value={form.value} onChange={handle} placeholder="5000000" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Notes</label>
            <textarea className="crm-input" name="notes" value={form.notes} onChange={handle} rows={3} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.title}>
            {mutation.isPending ? 'Creating...' : 'Create Deal'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
