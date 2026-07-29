'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../../lib/api';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { LeadStatusBadge } from '../../../components/ui/badge';
import { formatDate, formatRelativeTime } from '../../../lib/utils';
import { Plus, CheckCircle2, Circle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const TASK_TYPES = ['FOLLOW_UP', 'SITE_VISIT', 'CALL', 'EMAIL', 'MEETING', 'DOCUMENT', 'OTHER'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, filter],
    queryFn: () =>
      tasksApi.list({
        page,
        limit: 25,
        completed: filter === 'all' ? undefined : filter === 'completed' ? 'true' : 'false',
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      tasksApi.update(id, { isCompleted }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  if (isLoading && !data) return <PageLoader />;

  const tasks = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div>
      <Topbar
        title="Tasks & Follow-ups"
        subtitle={`${meta.total ?? 0} tasks`}
        actions={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Task
          </button>
        }
      />

      <div style={{ padding: '24px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(15,22,41,0.8)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              style={{
                padding: '6px 16px', borderRadius: '6px', border: 'none',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: filter === f ? '#818cf8' : '#64748b',
                transition: 'all 0.2s',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {tasks.map((task: any) => {
            const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(99,102,241,0.06)',
                  background: task.isCompleted ? 'rgba(16,185,129,0.02)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => completeMutation.mutate({ id: task.id, isCompleted: !task.isCompleted })}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: task.isCompleted ? '#10b981' : '#475569',
                    padding: 0, marginTop: '1px', flexShrink: 0,
                  }}
                >
                  {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '14px', fontWeight: '600',
                      color: task.isCompleted ? '#475569' : '#f1f5f9',
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </span>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                      {task.type?.replace('_', ' ')}
                    </span>
                    <LeadStatusBadge label={task.priority} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {task.lead && (
                      <span style={{ fontSize: '12px', color: '#6366f1' }}>
                        👤 {task.lead.firstName} {task.lead.lastName}
                      </span>
                    )}
                    {task.dueDate && (
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? '#f87171' : '#64748b' }}>
                        {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                        {formatDate(task.dueDate)}
                        {isOverdue && <span style={{ color: '#f87171', fontWeight: '600' }}>(Overdue)</span>}
                      </span>
                    )}
                    {task.assignedTo && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Assigned to {task.assignedTo.firstName}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#475569' }}>
                      {formatRelativeTime(task.createdAt)}
                    </span>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => { if (confirm('Delete task?')) deleteMutation.mutate(task.id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: '2px',
                    opacity: 0.6, transition: 'opacity 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                >
                  ✕
                </button>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>No tasks found</p>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{meta.total} tasks</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={meta.page === 1} style={{ padding: '6px 12px' }}><ChevronLeft size={14} /></button>
                <span style={{ padding: '6px 12px', color: '#94a3b8', fontSize: '13px' }}>{meta.page} / {meta.totalPages}</span>
                <button className="btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={meta.page === meta.totalPages} style={{ padding: '6px 12px' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', type: 'FOLLOW_UP', priority: 'MEDIUM', dueDate: '', description: '' });
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); onClose(); },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '440px', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Create Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Title*</label>
            <input className="crm-input" name="title" value={form.title} onChange={handle} placeholder="Task title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Type</label>
              <select className="crm-input" name="type" value={form.type} onChange={handle}>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Priority</label>
              <select className="crm-input" name="priority" value={form.priority} onChange={handle}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Due Date</label>
            <input className="crm-input" name="dueDate" type="datetime-local" value={form.dueDate} onChange={handle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Description</label>
            <textarea className="crm-input" name="description" value={form.description} onChange={handle} rows={3} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.title}>
            {mutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
