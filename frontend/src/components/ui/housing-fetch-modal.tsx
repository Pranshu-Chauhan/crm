'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, CheckCircle, Download, KeyRound,
  Loader2, Save, X,
} from 'lucide-react';
import { integrationsApi } from '../../lib/api';

type FetchResult = {
  recordsFetched: number;
  imported: number;
  duplicates: number;
  skipped: number;
  fetchedFrom: string;
  fetchedTo: string;
};

interface HousingFetchModalProps {
  onClose: () => void;
}

export function HousingFetchModal({ onClose }: HousingFetchModalProps) {
  const queryClient = useQueryClient();

  const [housingId, setHousingId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [fetchResult, setFetchResult] = useState<FetchResult | null>(null);

  // Load existing credentials (only housingId is returned – secret key is never exposed)
  const integration = useQuery({
    queryKey: ['housing-com-integration'],
    queryFn: () => integrationsApi.getHousingCom().then((r) => r.data),
  });

  useEffect(() => {
    if (integration.data?.connected) {
      setHousingId(integration.data.housingId);
    }
  }, [integration.data]);

  const connected: boolean = integration.data?.connected ?? false;
  const lastImportedAt: string | undefined = integration.data?.lastImportedAt;

  // ── Save credentials ──────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (data: { housingId: string; secretKey?: string }) =>
      integrationsApi.saveHousingCom(data),
    onSuccess: () => {
      setSecretKey('');
      setSaveMsg(
        'Credentials saved. Your secret key is encrypted and will not be shown again.',
      );
      queryClient.invalidateQueries({ queryKey: ['housing-com-integration'] });
    },
  });

  // ── Fetch leads ───────────────────────────────────────────────────────────
  const fetchMutation = useMutation({
    mutationFn: () => integrationsApi.fetchHousingLeads().then((r) => r.data),
    onSuccess: (result: FetchResult) => {
      setFetchResult(result);
      setSaveMsg(null);
      // Refresh all related queries so data updates instantly
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['housing-com-integration'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['recent-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['leads-by-source'] });
    },
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaveMsg(null);
    setFetchResult(null);
    saveMutation.mutate({
      housingId: housingId.trim(),
      ...(secretKey ? { secretKey } : {}),
    });
  };

  const saveError = saveMutation.error as any;
  const fetchError = fetchMutation.error as any;
  const errorMessage =
    saveError?.response?.data?.message ||
    fetchError?.response?.data?.message ||
    saveError?.message ||
    fetchError?.message;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card"
        style={{
          width: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          animation: 'fadeInUp 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
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
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#f1f5f9' }}>
                Fetch from Housing.com
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {connected
                  ? 'Pull new enquiries into your CRM'
                  : 'Connect your Housing.com developer credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info banner */}
        <div
          style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <KeyRound size={16} style={{ color: '#818cf8', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
            Enter the <strong style={{ color: '#a5b4fc' }}>Housing.com ID</strong> and{' '}
            <strong style={{ color: '#a5b4fc' }}>secret key</strong> provided by Housing.com for
            CRM integration. Once saved, hit <em>Fetch Leads</em> to pull enquiries directly into
            your leads list.
          </p>
        </div>

        {/* Credentials form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Housing.com ID *</label>
            <input
              className="crm-input"
              style={{ width: '100%' }}
              value={housingId}
              onChange={(e) => setHousingId(e.target.value)}
              required
              placeholder="Your Housing.com account ID"
              autoComplete="off"
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>
              Secret Key{' '}
              {connected && (
                <span style={{ color: '#475569', fontStyle: 'italic' }}>
                  (leave blank to keep saved key)
                </span>
              )}
            </label>
            <input
              className="crm-input"
              style={{ width: '100%' }}
              type="password"
              autoComplete="new-password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required={!connected}
              placeholder={connected ? '••••••••  (already saved)' : 'Secret key from Housing.com'}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              type="submit"
              disabled={saveMutation.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {saveMutation.isPending ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save size={14} />
              )}
              {saveMutation.isPending ? 'Saving…' : 'Save Credentials'}
            </button>

            {connected && (
              <button
                className="btn-primary"
                type="button"
                disabled={fetchMutation.isPending}
                onClick={() => {
                  setFetchResult(null);
                  setSaveMsg(null);
                  fetchMutation.mutate();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {fetchMutation.isPending ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Download size={14} />
                )}
                {fetchMutation.isPending ? 'Fetching leads…' : 'Fetch Leads Now'}
              </button>
            )}
          </div>
        </form>

        {/* Last import info */}
        {connected && lastImportedAt && (
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '12px' }}>
            Last import:{' '}
            <span style={{ color: '#64748b' }}>
              {new Date(lastImportedAt).toLocaleString()}
            </span>
          </p>
        )}

        {/* Status messages */}
        {saveMsg && !fetchMutation.isPending && (
          <Notice success text={saveMsg} style={{ marginTop: '16px' }} />
        )}

        {errorMessage && (
          <Notice success={false} text={errorMessage} style={{ marginTop: '16px' }} />
        )}

        {fetchResult && (
          <div
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              gap: '10px',
              marginTop: '16px',
            }}
          >
            <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '13px' }}>
                Fetch complete
              </p>
              <p style={{ color: '#a7f3d0', fontSize: '12px', marginTop: '4px', lineHeight: 1.5 }}>
                {fetchResult.recordsFetched} records fetched &nbsp;·&nbsp;{' '}
                {fetchResult.imported} imported &nbsp;·&nbsp;{' '}
                {fetchResult.duplicates} duplicates skipped &nbsp;·&nbsp;{' '}
                {fetchResult.skipped} without phone
              </p>
              <p style={{ color: '#475569', fontSize: '11px', marginTop: '6px' }}>
                Period:{' '}
                {new Date(fetchResult.fetchedFrom).toLocaleDateString()} –{' '}
                {new Date(fetchResult.fetchedTo).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function Notice({
  success,
  text,
  style: extraStyle,
}: {
  success: boolean;
  text: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: '10px',
        padding: '12px 14px',
        display: 'flex',
        gap: '10px',
        ...extraStyle,
      }}
    >
      <AlertCircle
        size={16}
        style={{ color: success ? '#34d399' : '#f87171', flexShrink: 0, marginTop: '1px' }}
      />
      <p style={{ color: success ? '#a7f3d0' : '#fecaca', fontSize: '12px', lineHeight: 1.5 }}>
        {text}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '6px',
};
