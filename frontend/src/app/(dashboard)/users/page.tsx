'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../lib/api';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { LeadStatusBadge } from '../../../components/ui/badge';
import { getInitials, formatRelativeTime, formatDate } from '../../../lib/utils';
import { Plus, Shield, User, Mail, Phone, Calendar, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { getStoredUser, type User as AuthUser } from '../../../lib/auth';

const ROLES = ['ADMIN', 'MANAGER', 'AGENT'];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  // Defer localStorage read to after hydration to avoid SSR/client mismatch.
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditUser(null);
    },
  });

  if (isLoading) return <PageLoader />;

  const userList = users || [];
  const adminCount = userList.filter((u: any) => u.role === 'ADMIN').length;
  const managerCount = userList.filter((u: any) => u.role === 'MANAGER').length;
  const agentCount = userList.filter((u: any) => u.role === 'AGENT').length;

  return (
    <div>
      <Topbar
        title="Team Management"
        subtitle={`${userList.length} team members`}
        actions={
          currentUser?.role === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Add Team Member
            </button>
          )
        }
      />

      <div style={{ padding: '24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Admins', count: adminCount, color: '#f59e0b', icon: Shield },
            { label: 'Managers', count: managerCount, color: '#6366f1', icon: User },
            { label: 'Agents', count: agentCount, color: '#10b981', icon: User },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${color}15`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#f1f5f9' }}>{count}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                {currentUser?.role === 'ADMIN' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {userList.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                      }}>
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {user.firstName} {user.lastName}
                          {user.id === currentUser?.id && (
                            <span style={{ fontSize: '10px', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>You</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <LeadStatusBadge label={user.role} />
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {user.phone && (
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={10} /> {user.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {user.isActive ? (
                        <CheckCircle size={14} color="#10b981" />
                      ) : (
                        <XCircle size={14} color="#ef4444" />
                      )}
                      <span style={{ fontSize: '12px', color: user.isActive ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}
                  </td>

                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {formatDate(user.createdAt)}
                  </td>

                  {currentUser?.role === 'ADMIN' && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {user.id !== currentUser?.id && (
                          <button
                            title="Edit user"
                            onClick={() => setEditUser(user)}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {user.id !== currentUser?.id && (
                          <button
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${user.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, color: user.isActive ? '#f87171' : '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}
                          >
                            {user.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {userList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
              <User size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>No team members found</p>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'AGENT' });
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '480px', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Add Team Member</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[{ name: 'firstName', label: 'First Name *' }, { name: 'lastName', label: 'Last Name *' }, { name: 'email', label: 'Email *' }, { name: 'phone', label: 'Phone' }, { name: 'password', label: 'Password *' }].map(({ name, label }) => (
            <div key={name} style={name === 'email' || name === 'password' ? { gridColumn: 'span 2' } : {}}>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>{label}</label>
              <input className="crm-input" name={name} type={name === 'password' ? 'password' : 'text'} value={(form as any)[name]} onChange={handle} />
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Role</label>
            <select className="crm-input" name="role" value={form.role} onChange={handle}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        {mutation.isError && (
          <div style={{ padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginTop: '12px', fontSize: '13px', color: '#f87171' }}>
            Failed to create user. Email may already exist.
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.firstName || !form.email || !form.password}>
            {mutation.isPending ? 'Creating...' : 'Add Member'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

function EditUserModal({ user, onClose }: { user: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', role: user.role });
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data: any) => usersApi.update(user.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '420px', padding: '28px', animation: 'fadeInUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>Edit {user.firstName}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>First Name</label>
              <input className="crm-input" name="firstName" value={form.firstName} onChange={handle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Last Name</label>
              <input className="crm-input" name="lastName" value={form.lastName} onChange={handle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Phone</label>
            <input className="crm-input" name="phone" value={form.phone} onChange={handle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Role</label>
            <select className="crm-input" name="role" value={form.role} onChange={handle}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
