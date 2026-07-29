'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, usersApi } from '../../../../lib/api';
import { Topbar } from '../../../../components/layout/topbar';
import { PageLoader } from '../../../../components/ui/loading';
import { LeadStatusBadge } from '../../../../components/ui/badge';
import {
  formatDate, formatRelativeTime, SOURCE_LABELS, BUDGET_LABELS, getInitials,
} from '../../../../lib/utils';
import {
  Phone, Mail, MapPin, Calendar, Edit2, Save, X,
  MessageSquare, Clock, CheckCircle2, ArrowLeft,
} from 'lucide-react';

const STATUSES = ['NEW', 'CONTACTED', 'SITE_VISIT', 'NEGOTIATION', 'BOOKED', 'WON', 'LOST'];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');
  const [editData, setEditData] = useState<any>({});

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.get(id).then((r) => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      setEditing(false);
    },
  });

  const noteMutation = useMutation({
    mutationFn: (text: string) => leadsApi.addNote(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      setNote('');
    },
  });

  if (isLoading) return <PageLoader />;
  if (!lead) return <div style={{ padding: '24px', color: '#f87171' }}>Lead not found</div>;

  const startEdit = () => {
    setEditData({
      status: lead.status,
      assignedToId: lead.assignedToId || '',
      notes: lead.notes || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
    });
    setEditing(true);
  };

  return (
    <div>
      <Topbar
        title={`${lead.firstName} ${lead.lastName}`}
        subtitle={`Lead · ${SOURCE_LABELS[lead.source] || lead.source}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => router.back()}
            >
              <ArrowLeft size={14} /> Back
            </button>
            {!editing ? (
              <button className="btn-primary" onClick={startEdit}>
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <>
                <button className="btn-secondary" onClick={() => setEditing(false)}>
                  <X size={14} /> Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() => updateMutation.mutate(editData)}
                  disabled={updateMutation.isPending}
                >
                  <Save size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        }
      />

      <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Main Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Lead Info Card */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '800', color: 'white',
              }}>
                {getInitials(lead.firstName, lead.lastName)}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>
                  {lead.firstName} {lead.lastName}
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                  <LeadStatusBadge label={lead.status} />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Created {formatRelativeTime(lead.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: Mail, label: 'Email', value: lead.email || '—' },
                { icon: MapPin, label: 'Location', value: lead.preferredCity ? `${lead.preferredCity}${lead.preferredLocality ? ', ' + lead.preferredLocality : ''}` : '—' },
                { icon: Calendar, label: 'Budget', value: BUDGET_LABELS[lead.budgetRange] || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  padding: '12px', borderRadius: '8px',
                  background: 'rgba(99,102,241,0.04)',
                  border: '1px solid rgba(99,102,241,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    <Icon size={12} /> {label}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>{value}</div>
                </div>
              ))}
            </div>

            {lead.notes && !editing && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.08)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Notes</div>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>{lead.notes}</p>
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Status</label>
                    <select
                      className="crm-input"
                      value={editData.status}
                      onChange={(e) => setEditData((d: any) => ({ ...d, status: e.target.value }))}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Assigned To</label>
                    <select
                      className="crm-input"
                      value={editData.assignedToId}
                      onChange={(e) => setEditData((d: any) => ({ ...d, assignedToId: e.target.value }))}
                    >
                      <option value="">Unassigned</option>
                      {(users || []).map((u: any) => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Follow-up Date</label>
                  <input
                    className="crm-input"
                    type="date"
                    value={editData.followUpDate}
                    onChange={(e) => setEditData((d: any) => ({ ...d, followUpDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Notes</label>
                  <textarea
                    className="crm-input"
                    value={editData.notes}
                    onChange={(e) => setEditData((d: any) => ({ ...d, notes: e.target.value }))}
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Add Note */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} /> Add Note
            </h3>
            <textarea
              className="crm-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note, call log, or update..."
              rows={3}
              style={{ resize: 'vertical', marginBottom: '10px' }}
            />
            <button
              className="btn-primary"
              onClick={() => note.trim() && noteMutation.mutate(note)}
              disabled={noteMutation.isPending || !note.trim()}
            >
              {noteMutation.isPending ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Activity Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(lead.activities || []).map((activity: any, i: number) => (
                <div key={activity.id} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: getActivityColor(activity.type),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', flexShrink: 0,
                    }}>
                      {getActivityIcon(activity.type)}
                    </div>
                    {i < (lead.activities?.length ?? 0) - 1 && (
                      <div style={{ width: '1px', flex: 1, background: 'rgba(99,102,241,0.1)', marginTop: '4px', minHeight: '16px' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#f1f5f9' }}>{activity.title}</div>
                    {activity.description && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{activity.description}</div>
                    )}
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                      {formatRelativeTime(activity.createdAt)}
                      {activity.user && ` · ${activity.user.firstName}`}
                    </div>
                  </div>
                </div>
              ))}
              {(!lead.activities || lead.activities.length === 0) && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: '13px' }}>
                  No activity yet
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          {lead.tasks && lead.tasks.length > 0 && (
            <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>Tasks</h3>
              {lead.tasks.map((task: any) => (
                <div key={task.id} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  padding: '8px 0', borderBottom: '1px solid rgba(99,102,241,0.06)',
                }}>
                  {task.isCompleted ? <CheckCircle2 size={16} color="#10b981" /> : <Clock size={16} color="#64748b" />}
                  <div>
                    <div style={{ fontSize: '13px', color: task.isCompleted ? '#475569' : '#f1f5f9', fontWeight: '500', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    {task.dueDate && (
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getActivityColor(type: string): string {
  const map: Record<string, string> = {
    LEAD_CREATED: 'rgba(99,102,241,0.15)',
    STATUS_CHANGED: 'rgba(245,158,11,0.15)',
    NOTE_ADDED: 'rgba(139,92,246,0.15)',
    TASK_CREATED: 'rgba(6,182,212,0.15)',
    TASK_COMPLETED: 'rgba(16,185,129,0.15)',
    LEAD_ASSIGNED: 'rgba(99,102,241,0.15)',
    LEAD_IMPORTED: 'rgba(99,102,241,0.15)',
  };
  return map[type] || 'rgba(100,116,139,0.15)';
}

function getActivityIcon(type: string): string {
  const map: Record<string, string> = {
    LEAD_CREATED: '✨',
    STATUS_CHANGED: '🔄',
    NOTE_ADDED: '📝',
    TASK_CREATED: '📋',
    TASK_COMPLETED: '✅',
    LEAD_ASSIGNED: '👤',
    LEAD_IMPORTED: '📥',
    CALL_LOGGED: '📞',
    EMAIL_SENT: '📧',
    SITE_VISIT_SCHEDULED: '🏠',
  };
  return map[type] || '●';
}
