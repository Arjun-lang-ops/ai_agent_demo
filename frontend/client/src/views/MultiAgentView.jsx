import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/Toast';
import { Bot, Brain, Send, Sparkles, Shield, Layers, Activity, Copy, Check, AlertCircle } from '../components/Icons';

const PRESETS = [
  'Synthesize the core findings and propose actionable recommendations',
  'Identify conflicting policies or ambiguous requirements in the documents',
  'Extract all procedural milestones and validate against guidelines',
];

export const MultiAgentView = () => {
  const [query, setQuery] = useState('');
  const [agentMode, setAgentMode] = useState('multi');   // 'multi' | 'single'
  const [docId, setDocId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.documents.getAll().then(r => { if (r.success) setDocuments(r.documents || []); }).catch(() => {});
  }, []);

  const run = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const fn = agentMode === 'multi' ? api.agents.runMultiAgent : api.agents.runRagAgent;
      const res = await fn({ query: query.trim(), documentId: docId || undefined });
      if (res.success && res.data) setResult(res.data);
      else throw new Error(res.message || 'Agent returned no output');
    } catch (err) {
      setToast({ message: err.message || 'Agent execution failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={22} color="#a78bfa" />
          </div>
          <div>
            <h1 className="section-title">Autonomous Agent Orchestrator</h1>
            <p className="section-subtitle">LangGraph supervisor routing · input/output guardrails</p>
          </div>
        </div>

        {/* Mode picker */}
        <div style={{ display: 'flex', background: '#0d1526', borderRadius: 10, padding: 4, border: '1px solid #1e293b' }}>
          {[
            { id: 'multi',  label: 'Multi-Agent Supervisor' },
            { id: 'single', label: 'Single RAG Agent'       },
          ].map(m => (
            <button key={m.id} onClick={() => setAgentMode(m.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: agentMode === m.id ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                color: agentMode === m.id ? '#fff' : '#64748b',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Query Card ── */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label className="label" style={{ margin: 0 }}>Document scope:</label>
            <select className="select" value={docId} onChange={e => setDocId(e.target.value)}>
              <option value="">All tenant documents</option>
              {documents.map(d => <option key={d._id} value={d._id}>{d.originalName.slice(0, 36)}{d.originalName.length > 36 ? '…' : ''}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#34d399' }}>
            <Shield size={13} color="#34d399" /> Prompt injection detection active
          </div>
        </div>

        <form onSubmit={run} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <textarea
            rows={3}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Describe the objective or question for the autonomous agent…"
            className="input"
            style={{ resize: 'none', lineHeight: 1.6 }}
          />

          {/* Quick prompts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#475569', alignSelf: 'center' }}>Try:</span>
            {PRESETS.map((p, i) => (
              <button key={i} type="button" onClick={() => setQuery(p)} className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>
                {p.slice(0, 40)}…
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={!query.trim() || loading} className="btn btn-primary">
              {loading
                ? <><span className="spinner" /> Agent Reasoning…</>
                : <><Bot size={16} /> Run {agentMode === 'multi' ? 'Multi-Agent' : 'Agent'}</>}
            </button>
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-slide-up">

          {/* Meta badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {result.selectedAgent && <span className="badge badge-purple">Agent: {result.selectedAgent}</span>}
            {result.sources?.length > 0 && <span className="badge badge-blue">{result.sources.length} sources retrieved</span>}
            {result.agentHistory?.length > 0 && <span className="badge badge-slate">{result.agentHistory.length} reasoning steps</span>}
          </div>

          {/* Answer */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1e293b' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={17} color="#818cf8" /> Agent Answer
              </h2>
              <button onClick={copyAnswer} className="btn btn-secondary btn-sm">
                {copied ? <><Check size={13} color="#34d399" /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {result.answer || (typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
            </div>
          </div>

          {/* Agent History */}
          {result.agentHistory?.length > 0 && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={17} color="#fbbf24" /> Execution Trace ({result.agentHistory.length} steps)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.agentHistory.map((step, i) => (
                  <div key={i} style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>
                      Step {i + 1}{typeof step === 'object' && step.agent ? ` · ${step.agent}` : ''}
                    </div>
                    <pre className="code-block" style={{ margin: 0, border: 'none', padding: 0, background: 'transparent', fontSize: 11 }}>
                      {typeof step === 'object' ? JSON.stringify(step, null, 2) : String(step)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={17} color="#22d3ee" /> Retrieved Context Documents
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {result.sources.map((s, i) => (
                  <div key={i} style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#22d3ee', marginBottom: 8 }}>
                      <span>Source #{i + 1}</span>
                      {s.score !== undefined && <span style={{ color: '#475569', fontFamily: 'monospace' }}>score: {s.score.toFixed(3)}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.content || JSON.stringify(s)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />}
    </div>
  );
};
