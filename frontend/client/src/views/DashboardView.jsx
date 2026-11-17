import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Brain, Database, Bot, Search, Sparkles, Layers, Upload,
  Network, ChevronRight, BarChart, Activity, CheckCircle
} from '../components/Icons';

const StatCard = ({ label, value, sub, Icon, color }) => (
  <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 50, height: 50, borderRadius: 14,
      background: `${color}18`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color, marginTop: 3, fontWeight: 500 }}>{sub}</div>
    </div>
  </div>
);

const QuickCard = ({ Icon, color, title, desc, onClick }) => (
  <div className="card card-hover" onClick={onClick} style={{ padding: 24 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: `${color}18`,
      border: `1px solid ${color}30`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: 16,
    }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
      <ChevronRight size={16} color="#334155" />
    </div>
    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{desc}</p>
  </div>
);

export const DashboardView = ({ setActiveTab }) => {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState({ docs: 0, chunked: 0, embedded: 0, tools: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [docsRes, mcpRes] = await Promise.allSettled([
          api.documents.getAll(), api.mcp.getTools(),
        ]);
        if (!alive) return;
        const docs = docsRes.status === 'fulfilled' ? (docsRes.value?.documents || []) : [];
        const tools = mcpRes.status === 'fulfilled' ? (mcpRes.value?.tools?.length || 0) : 0;
        setStats({
          docs: docs.length,
          chunked: docs.filter(d => ['CHUNKED', 'EMBEDDED'].includes(d.status)).length,
          embedded: docs.filter(d => d.status === 'EMBEDDED').length,
          tools,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const val = (n) => loading ? '—' : n;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: 20, border: '1px solid rgba(79,70,229,0.25)',
        background: 'linear-gradient(135deg, #0d1526 0%, #131a2e 100%)',
        padding: '28px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 11, fontWeight: 600, color: '#818cf8', marginBottom: 10 }}>
              <Sparkles size={12} color="#818cf8" /> Multi-Tenant Enterprise AI Hub
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: '#f1f5f9' }}>
              Welcome back, {user?.fullname?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', maxWidth: 520, lineHeight: 1.6 }}>
              You're operating the <strong style={{ color: '#e2e8f0' }}>{tenant?.name || 'your organization'}</strong> workspace. Upload documents, run agents, and query your knowledge base below.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('rag')}>
              <Brain size={16} /> Open RAG Studio
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('knowledge')}>
              <Upload size={16} /> Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Documents Uploaded" value={val(stats.docs)} sub="Stored in tenant store" Icon={Database} color="#818cf8" />
        <StatCard label="Chunked Documents" value={val(stats.chunked)} sub="Semantic text splitting" Icon={Layers} color="#34d399" />
        <StatCard label="Embedded Documents" value={val(stats.embedded)} sub="768-dim Gemini vectors" Icon={Brain} color="#22d3ee" />
        <StatCard label="MCP Tools Available" value={val(stats.tools)} sub="Model Context Protocol" Icon={Network} color="#fbbf24" />
      </div>

      {/* ── Pipeline Stages ── */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#818cf8" /> Knowledge Pipeline
            </h2>
            <p className="section-subtitle">5-stage document processing and reasoning flow</p>
          </div>
          <span className="badge badge-green">● Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { stage: '01', label: 'Ingest', desc: 'Upload PDF, DOCX, TXT — text extracted automatically.', color: '#818cf8', action: 'Manage Docs', tab: 'knowledge' },
            { stage: '02', label: 'Chunking', desc: 'Recursive split with overlap to preserve context.', color: '#34d399', action: null },
            { stage: '03', label: 'Embedding', desc: 'Gemini 768-dim vectors stored in MongoDB Atlas.', color: '#22d3ee', action: 'View Search', tab: 'search' },
            { stage: '04', label: 'Retrieval', desc: 'RRF combining vector distance + BM25 keyword.', color: '#fbbf24', action: 'Try Search', tab: 'search' },
            { stage: '05', label: 'Generation', desc: 'LangGraph agents answer with cited sources.', color: '#a78bfa', action: 'Ask AI', tab: 'rag' },
          ].map(({ stage, label, desc, color, action, tab }) => (
            <div key={stage} style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Stage {stage}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{label}</div>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              {action && (
                <button onClick={() => setActiveTab(tab)} className="btn btn-ghost btn-sm" style={{ marginTop: 'auto', padding: '5px 0', color, justifyContent: 'flex-start', fontSize: 12 }}>
                  {action} <ChevronRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Launch ── */}
      <div>
        <h2 className="section-title" style={{ marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <QuickCard Icon={Brain} color="#818cf8" title="RAG Studio" desc="Chat with your documents using real-time streaming and source citations." onClick={() => setActiveTab('rag')} />
          <QuickCard Icon={Bot} color="#a78bfa" title="Multi-Agent" desc="Run supervisor-routed LangGraph workflows with output guardrails." onClick={() => setActiveTab('agents')} />
          <QuickCard Icon={Search} color="#22d3ee" title="Search Explorer" desc="Inspect raw retrieval scores across vector and hybrid search modes." onClick={() => setActiveTab('search')} />
          <QuickCard Icon={Network} color="#34d399" title="MCP Tools" desc="Browse and test Model Context Protocol tool definitions live." onClick={() => setActiveTab('mcp')} />
        </div>
      </div>
    </div>
  );
};
