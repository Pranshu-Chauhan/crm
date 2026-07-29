'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Download, KeyRound, Save } from 'lucide-react';
import { Topbar } from '../../../components/layout/topbar';
import { integrationsApi } from '../../../lib/api';

type FetchResult = {
  recordsFetched: number;
  imported: number;
  duplicates: number;
  skipped: number;
  fetchedFrom: string;
  fetchedTo: string;
};

export default function ImportPage() {
  const queryClient = useQueryClient();
  const [housingId, setHousingId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<FetchResult | null>(null);

  const integration = useQuery({ queryKey: ['housing-com-integration'], queryFn: integrationsApi.getHousingCom });

  useEffect(() => {
    const data = integration.data?.data;
    if (data?.connected) {
      setHousingId(data.housingId);
    }
  }, [integration.data]);

  const save = useMutation({
    mutationFn: (data: { housingId: string; secretKey?: string }) => integrationsApi.saveHousingCom(data),
    onSuccess: () => {
      setSecretKey('');
      setMessage('Housing.com credentials saved. Your secret key is encrypted and will not be shown again.');
      queryClient.invalidateQueries({ queryKey: ['housing-com-integration'] });
    },
  });

  const fetchLeads = useMutation({
    mutationFn: () => integrationsApi.fetchHousingLeads(),
    onSuccess: (response) => {
      setResult(response.data);
      setMessage(null);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['housing-com-integration'] });
      queryClient.invalidateQueries({ queryKey: ['recent-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['leads-by-source'] });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setResult(null);
    save.mutate({ housingId: housingId.trim(), ...(secretKey ? { secretKey } : {}) });
  };

  const error = save.error || fetchLeads.error || integration.error;
  const errorMessage = (error as any)?.response?.data?.message || (error as Error | null)?.message;
  const connected = integration.data?.data?.connected;
  const lastImportedAt = integration.data?.data?.lastImportedAt;

  return (
    <div>
      <Topbar title="Housing.com Leads" subtitle="Connect your Housing.com developer credentials and fetch leads" />

      <div style={{ padding: '24px', maxWidth: '900px' }}>
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <KeyRound size={24} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#a5b4fc', marginBottom: '4px' }}>Housing.com CRM credentials</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Enter the Housing.com ID and secret key provided by Housing.com for CRM integration. After saving, use Fetch Leads to pull enquiries into your CRM. Only leads you fetch or create manually will appear in your account.
            </p>
          </div>
        </div>

        <form className="glass-card" onSubmit={submit} style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '16px', marginBottom: '18px' }}>Your Housing.com credentials</h3>

          <label style={labelStyle}>Housing.com ID</label>
          <input
            className="crm-input"
            style={{ width: '100%', marginBottom: '16px' }}
            value={housingId}
            onChange={(event) => setHousingId(event.target.value)}
            required
            placeholder="Your Housing.com account ID"
          />

          <label style={labelStyle}>Secret key {connected ? '(leave blank to keep saved key)' : ''}</label>
          <input
            className="crm-input"
            style={{ width: '100%', marginBottom: '16px' }}
            type="password"
            autoComplete="new-password"
            value={secretKey}
            onChange={(event) => setSecretKey(event.target.value)}
            required={!connected}
            placeholder="Secret key from Housing.com"
          />

          <button className="btn-primary" type="submit" disabled={save.isPending} style={{ marginTop: '8px' }}>
            <Save size={14} />
            {save.isPending ? 'Saving…' : 'Save credentials'}
          </button>
        </form>

        {connected && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ color: '#f1f5f9', fontSize: '16px', marginBottom: '7px' }}>Fetch leads</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.55, marginBottom: '16px' }}>
              Pulls leads from Housing.com for the last 90 days on the first fetch, then only new leads since your last import. Duplicate records (same project, date, and phone) are skipped.
              {lastImportedAt && (
                <span style={{ display: 'block', marginTop: '8px', color: '#64748b' }}>
                  Last imported: {new Date(lastImportedAt).toLocaleString()}
                </span>
              )}
            </p>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => { setResult(null); setMessage(null); fetchLeads.mutate(); }}
              disabled={fetchLeads.isPending}
            >
              <Download size={14} />
              {fetchLeads.isPending ? 'Fetching leads…' : 'Fetch leads from Housing.com'}
            </button>
          </div>
        )}

        {(message || errorMessage) && <Notice success={Boolean(message)} text={message || errorMessage || ''} />}
        {result && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '18px 20px', display: 'flex', gap: '12px' }}>
            <CheckCircle size={24} style={{ color: '#34d399', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#6ee7b7', fontWeight: 600 }}>Fetch completed</p>
              <p style={{ color: '#a7f3d0', fontSize: '13px', marginTop: '4px' }}>
                Fetched {result.recordsFetched}; imported {result.imported}; skipped {result.duplicates} duplicates and {result.skipped} records without a phone number.
              </p>
              <p style={{ color: '#64748b', fontSize: '11px', marginTop: '7px' }}>
                Period: {new Date(result.fetchedFrom).toLocaleDateString()} – {new Date(result.fetchedTo).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Notice({ success, text }: { success: boolean; text: string }) {
  return (
    <div style={{ background: success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '10px' }}>
      <AlertCircle size={19} style={{ color: success ? '#34d399' : '#f87171', flexShrink: 0 }} />
      <p style={{ color: success ? '#a7f3d0' : '#fecaca', fontSize: '13px', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' };
