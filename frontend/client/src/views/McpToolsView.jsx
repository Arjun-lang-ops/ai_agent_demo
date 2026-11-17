import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/Toast';
import { Network, Play, Refresh } from '../components/Icons';

export const McpToolsView = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search_documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [runningSearch, setRunningSearch] = useState(false);
  const [searchOutput, setSearchOutput] = useState(null);
  const [runningList, setRunningList] = useState(false);
  const [listOutput, setListOutput] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchTools = async () => {
    try {
      setLoading(true);
      const res = await api.mcp.getTools();
      if (res.success) setTools(res.tools || []);
    } catch (err) {
      setToast({ message: err.message || 'Failed to load MCP tools', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTools(); }, []);

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || runningSearch) return;
    setRunningSearch(true);
    setSearchOutput(null);
    try {
      const res = await api.mcp.search({ query: searchQuery.trim(), limit: searchLimit });
      if (res.success) setSearchOutput(res.data);
    } catch (err) {
      setToast({ message: err.message || 'Tool execution failed', type: 'error' });
    } finally {
      setRunningSearch(false);
    }
  };

  const runList = async () => {
    setRunningList(true);
    setListOutput(null);
    try {
      const res = await api.mcp.listDocuments();
      if (res.success) setListOutput(res.data);
    } catch (err) {
      setToast({ message: err.message || 'Tool execution failed', type: 'error' });
    } finally {
      setRunningList(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Network size={22} color="#4ade80" />
          </div>
          <div>
            <h1 className="section-title">MCP Tools</h1>
            <p className="section-subtitle">Model Context Protocol — standardized tool interface for agents</p>
          </div>
        </div>
        <button onClick={fetchTools} disabled={loading} className="btn btn-secondary btn-sm">
          <Refresh size={14} className={loading ? 'animate-spin' : ''} /> Refresh Tools
        </button>
      </div>

      {/* ── Tool Catalog ── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
            Registered Tools ({tools.length})
          </h2>
          <span className="badge badge-green">● Connected</span>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <span className="spinner spinner-dark" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Discovering MCP tools…</p>
          </div>
        ) : tools.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>No tools discovered. Ensure the MCP server is initialized.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {tools.map((tool, i) => (
              <div key={tool.name || i} style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <code style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(74,222,128,0.2)' }}>
                    {tool.name}
                  </code>
                  <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>MCP</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  {tool.description || 'No description provided.'}
                </p>
                {tool.inputSchema?.properties && (
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10, marginTop: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Parameters</div>
                    <pre className="code-block" style={{ margin: 0, fontSize: 11 }}>
                      {JSON.stringify(tool.inputSchema.properties, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tool Playground ── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
              <Play size={15} color="#4ade80" style={{ verticalAlign: 'middle', marginRight: 7 }} />
              Interactive Tool Runner
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
              Execute MCP tool calls and inspect raw JSON output
            </p>
          </div>

          {/* Tool tab picker */}
          <div style={{ display: 'flex', gap: 2, background: '#0d1526', borderRadius: 8, padding: 4, border: '1px solid #1e293b' }}>
            {['search_documents', 'list_documents'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  border: 'none', cursor: 'pointer', fontFamily: 'monospace',
                  background: activeTab === t ? '#16a34a' : 'transparent',
                  color: activeTab === t ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* search_documents tab */}
        {activeTab === 'search_documents' && (
          <form onSubmit={runSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
              <div>
                <label className="label">query (string, required)</label>
                <input className="input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. 'what is the project roadmap?'" />
              </div>
              <div>
                <label className="label">limit (1–10)</label>
                <input className="input" type="number" min="1" max="10" value={searchLimit} onChange={e => setSearchLimit(Number(e.target.value))} style={{ width: 70 }} />
              </div>
            </div>
            <div>
              <button type="submit" disabled={!searchQuery.trim() || runningSearch} className="btn btn-success">
                {runningSearch ? <><span className="spinner" /> Running…</> : <><Play size={14} /> Call search_documents</>}
              </button>
            </div>
            {searchOutput && (
              <div>
                <label className="label">Tool Output</label>
                <pre className="code-block" style={{ maxHeight: 320, overflowY: 'auto' }}>{JSON.stringify(searchOutput, null, 2)}</pre>
              </div>
            )}
          </form>
        )}

        {/* list_documents tab */}
        {activeTab === 'list_documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              Calls <code style={{ color: '#4ade80' }}>list_documents</code> scoped automatically to your authenticated tenant.
              No parameters required.
            </p>
            <div>
              <button onClick={runList} disabled={runningList} className="btn btn-success">
                {runningList ? <><span className="spinner" /> Running…</> : <><Play size={14} /> Call list_documents</>}
              </button>
            </div>
            {listOutput && (
              <div>
                <label className="label">Tool Output</label>
                <pre className="code-block" style={{ maxHeight: 320, overflowY: 'auto' }}>{JSON.stringify(listOutput, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />}
    </div>
  );
};
