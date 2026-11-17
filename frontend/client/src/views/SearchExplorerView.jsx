import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/Toast';
import { Search, Layers, Copy, Check } from '../components/Icons';

export const SearchExplorerView = () => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('hybrid');  // 'hybrid' | 'vector'
  const [limit, setLimit] = useState(5);
  const [docId, setDocId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    api.documents.getAll().then(r => { if (r.success) setDocuments(r.documents || []); }).catch(() => {});
  }, []);

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResults(null);
    try {
      const fn = mode === 'hybrid' ? api.search.hybrid : api.search.vector;
      const res = await fn({ query: query.trim(), limit, documentId: docId || undefined });
      if (res.success) setResults(res.results || []);
    } catch (err) {
      setToast({ message: err.message || 'Search failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scoreColor = (score) => {
    if (!score) return '#64748b';
    if (score >= 0.8) return '#34d399';
    if (score >= 0.5) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} color="#22d3ee" />
          </div>
          <div>
            <h1 className="section-title">Search Explorer</h1>
            <p className="section-subtitle">Inspect raw retrieval scores across vector and hybrid search modes</p>
          </div>
        </div>

        {/* Mode Picker */}
        <div style={{ display: 'flex', background: '#0d1526', borderRadius: 10, padding: 4, border: '1px solid #1e293b' }}>
          {[
            { id: 'hybrid', label: 'Hybrid Search (Vector + BM25)' },
            { id: 'vector', label: 'Vector Only' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: mode === m.id ? 'linear-gradient(135deg, #0891b2, #0e7490)' : 'transparent',
                color: mode === m.id ? '#fff' : '#64748b',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Form ── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <form onSubmit={runSearch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#475569" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter a concept, keyword, or question to search your knowledge base…"
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            {/* Document filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Filter by doc:</label>
              <select className="select" value={docId} onChange={e => setDocId(e.target.value)} style={{ maxWidth: 220 }}>
                <option value="">All Documents</option>
                {documents.map(d => <option key={d._id} value={d._id}>{d.originalName.slice(0, 32)}{d.originalName.length > 32 ? '…' : ''}</option>)}
              </select>
            </div>

            {/* Limit slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="label" style={{ margin: 0 }}>Max chunks (K):</label>
              <input type="range" min="1" max="20" value={limit} onChange={e => setLimit(Number(e.target.value))}
                style={{ width: 100, accentColor: '#22d3ee' }} />
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22d3ee', minWidth: 20 }}>{limit}</span>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={!query.trim() || loading} className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)', boxShadow: '0 4px 14px rgba(8,145,178,0.3)' }}>
                {loading ? <><span className="spinner" /> Searching…</> : <><Search size={15} /> {mode === 'hybrid' ? 'Hybrid Search' : 'Vector Search'}</>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#22d3ee" />
              {results.length > 0 ? `${results.length} Matching Chunks` : 'No Results'}
            </h2>
            <span className="badge badge-cyan">{mode.toUpperCase()}</span>
          </div>

          {results.length === 0 ? (
            <div className="card empty-state">
              <Layers size={36} />
              <h3>No matching chunks found</h3>
              <p>Try a different query or ensure documents have been embedded.</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const score = item.score ?? item.similarity;
              const docName = item.metadata?.originalName || item.documentName || 'Document';
              const id = item._id || idx;
              return (
                <div key={id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#22d3ee' }}>#{idx + 1}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{docName}</div>
                        <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>Chunk {item.chunkIndex ?? idx} · id …{String(id).slice(-6)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {score !== undefined && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: scoreColor(score) }}>
                            {typeof score === 'number' ? score.toFixed(4) : score}
                          </div>
                        </div>
                      )}
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => copy(item.content, id)} title="Copy chunk text">
                        {copiedId === id ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="code-block" style={{ maxHeight: 200, overflowY: 'auto' }}>{item.content}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />}
    </div>
  );
};
