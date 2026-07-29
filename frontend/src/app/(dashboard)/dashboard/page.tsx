'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, integrationsApi, leadsApi } from '../../../lib/api';
import { StatCard } from '../../../components/ui/stat-card';
import { Topbar } from '../../../components/layout/topbar';
import { PageLoader } from '../../../components/ui/loading';
import { LeadStatusBadge } from '../../../components/ui/badge';
import {
  Users, TrendingUp, CheckSquare, Award, AlertCircle,
  Calendar, Building2, ArrowRight, Download,
} from 'lucide-react';
import { formatCurrency, formatRelativeTime, SOURCE_LABELS } from '../../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import Link from 'next/link';
import { useState } from 'react';
import { HousingFetchModal } from '../../../components/ui/housing-fetch-modal';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

export default function DashboardPage() {
  const [showHousingModal, setShowHousingModal] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardApi.kpis().then((r) => r.data),
  });

  const { data: housingIntegration } = useQuery({
    queryKey: ['housing-com-integration'],
    queryFn: () => integrationsApi.getHousingCom().then((r) => r.data),
  });

  const { data: leadsByStatus } = useQuery({
    queryKey: ['leads-by-status'],
    queryFn: () => dashboardApi.leadsByStatus().then((r) => r.data),
  });

  const { data: leadsBySource } = useQuery({
    queryKey: ['leads-by-source'],
    queryFn: () => dashboardApi.leadsBySource().then((r) => r.data),
  });

  const { data: leadTrend } = useQuery({
    queryKey: ['lead-trend'],
    queryFn: () => dashboardApi.leadTrend().then((r) => r.data),
  });

  const { data: recentLeads } = useQuery({
    queryKey: ['recent-leads'],
    queryFn: () => dashboardApi.recentLeads().then((r) => r.data),
  });

  const { data: agentPerf } = useQuery({
    queryKey: ['agent-performance'],
    queryFn: () => dashboardApi.agentPerformance().then((r) => r.data),
  });

  if (kpisLoading) return <PageLoader />;

  return (
    <div style={{ padding: '0' }}>
      <Topbar
        title="Dashboard"
        subtitle="Welcome back! Here's your sales overview."
      />

      <div style={{ padding: '24px' }}>
        {/* Housing.com setup nudge — shown when not yet connected */}
        {!nudgeDismissed && housingIntegration && !housingIntegration.connected && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Download size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#c7d2fe', marginBottom: '2px' }}>
                Connect Housing.com to auto-import leads
              </p>
              <p style={{ fontSize: '12px', color: '#818cf8', lineHeight: 1.5 }}>
                Add your Housing.com ID &amp; secret key once and fetch new enquiries straight into your CRM with one click.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn-primary"
                onClick={() => setShowHousingModal(true)}
                style={{ fontSize: '12px', padding: '7px 14px' }}
              >
                <Download size={13} />
                Connect now
              </button>
              <button
                onClick={() => setNudgeDismissed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '4px',
                }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard
            title="Total Leads"
            value={kpis?.totalLeads ?? 0}
            change={kpis?.leadGrowth}
            icon={Users}
            color="indigo"
            subtitle={`${kpis?.newLeadsThisMonth ?? 0} new this month`}
          />
          <StatCard
            title="Active Deals"
            value={kpis?.activeDeals ?? 0}
            icon={TrendingUp}
            color="purple"
            subtitle={`${kpis?.wonDealsThisMonth ?? 0} won this month`}
          />
          <StatCard
            title="Pending Tasks"
            value={kpis?.pendingTasks ?? 0}
            icon={CheckSquare}
            color="amber"
            subtitle={`${kpis?.overdueTasksCount ?? 0} overdue`}
          />
          <StatCard
            title="Follow-ups Today"
            value={kpis?.followUpsToday ?? 0}
            icon={Calendar}
            color="cyan"
            subtitle="Due in next 7 days"
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Lead Trend */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>Lead Trend (30 days)</h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>New leads per day</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={leadTrend || []}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(99,102,241,0.1)' }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2236', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Source */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>Leads by Source</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={(leadsBySource || []).map((d: any) => ({ name: SOURCE_LABELS[d.source] || d.source, value: d.count }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value"
                >
                  {(leadsBySource || []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a2236', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Recent Leads */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>Recent Leads</h3>
              <Link href="/leads" style={{ fontSize: '12px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(recentLeads || []).map((lead: any) => (
                <Link href={`/leads/${lead.id}`} key={lead.id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px', borderRadius: '8px',
                    background: 'rgba(99,102,241,0.04)',
                    border: '1px solid rgba(99,102,241,0.08)',
                    transition: 'all 0.2s', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0,
                    }}>
                      {lead.firstName[0]}{lead.lastName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {lead.preferredCity} · {lead.source?.replace('_', ' ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <LeadStatusBadge label={lead.status} />
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                        {formatRelativeTime(lead.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>Agent Performance</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(agentPerf || []).slice(0, 5).map((agent: any) => (
                <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0,
                  }}>
                    {agent.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>
                      {agent.name}
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.1)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        width: `${agent.totalLeads > 0 ? (agent.wonLeads / agent.totalLeads * 100) : 0}%`,
                      }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{agent.totalLeads}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{agent.wonLeads} won</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showHousingModal && <HousingFetchModal onClose={() => setShowHousingModal(false)} />}
    </div>
  );
}
