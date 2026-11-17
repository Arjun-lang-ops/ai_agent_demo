import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/Toast';
import {
  Brain, Send, Sparkles, Database, Layers, Activity,
  Copy, Check, Refresh, AlertCircle
} from '../components/Icons';

const SUGGESTIONS = [
  'Summarize the key points from the uploaded documents',
  'What are the main requirements described in the files?',
  'Identify any risks or concerns mentioned in the documents',
];

export const RagStudioView = () => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! Ask me anything about your uploaded documents. I will generate grounded answers with source citations.',
    sources: [],
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const [streamStatus, setStreamStatus] = useState('');
  const [documents, setDocuments] = useState([]);
  const [scopeDocId, setScopeDocId] = useState('');
  const [topK, setTopK] = useState(5);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.documents.getAll().then(r => { if (r.success) setDocuments(r.documents || []); }).catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamStatus]);

  const submit = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);
    setStreamStatus(streamMode ? 'Searching your documents…' : '');

    const userMsg = { role: 'user', content: q };
    const aiMsg  = { role: 'assistant', content: '', sources: [], isStreaming: streamMode };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    const aiIdx = messages.length + 1;

    if (streamMode) {
      let text = '';
      let srcs = [];
      try {
        await api.rag.stream({
          query: q, limit: topK, documentId: scopeDocId || undefined,
          onStatus: s => setStreamStatus(s),
          onSources: ss => { srcs = ss || []; setMessages(prev => { const u=[...prev]; if(u[aiIdx]) u[aiIdx].sources=srcs; return u; }); },
          onToken: t => { text += t; setMessages(prev => { const u=[...prev]; if(u[aiIdx]) u[aiIdx].content=text; return u; }); },
          onDone: () => { setMessages(prev => { const u=[...prev]; if(u[aiIdx]) u[aiIdx].isStreaming=false; return u; }); setStreamStatus(''); setLoading(false); },
          onError: err => { setToast({ message: err, type: 'error' }); setStreamStatus(''); setLoading(false); setMessages(prev => { const u=[...prev]; if(u[aiIdx]) { u[aiIdx].isStreaming=false; if(!u[aiIdx].content) u[aiIdx].content=`Error: ${err}`; } return u; }); },
        });
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
        setStreamStatus('');
        setLoading(false);
      }
    } else {
      try {
        const res = await api.rag.ask({ query: q, limit: topK, documentId: scopeDocId || undefined });
        if (res.success && res.data) {
          setMessages(prev => { const u=[...prev]; if(u[aiIdx]) { u[aiIdx].content=res.data.answer||'No answer returned.'; u[aiIdx].sources=res.data.sources||[]; u[aiIdx].isStreaming=false; } return u; });
        }
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
        setMessages(prev => { const u=[...prev]; if(u[aiIdx]) { u[aiIdx].content=`Error: ${err.message}`; u[aiIdx].isStreaming=false; } return u; });
      } finally {
        setLoading(false);
      }
    }
  };

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => setMessages([{
    role: 'assistant', content: 'Chat cleared. What would you like to know?', sources: [],
  }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: 14 }} className="animate-fade-in">

      {/* ── Toolbar ── */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={19} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>RAG Studio</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Hybrid retrieval + Gemini 2.5 Flash generation</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {/* Document Scope */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Scope:</span>
            <select className="select" value={scopeDocId} onChange={e => setScopeDocId(e.target.value)} style={{ maxWidth: 180 }}>
              <option value="">All Documents</option>
              {documents.map(d => <option key={d._id} value={d._id}>{d.originalName.slice(0, 30)}{d.originalName.length > 30 ? '…' : ''}</option>)}
            </select>
          </div>

          {/* Top-K */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Sources:</span>
            <select className="select" value={topK} onChange={e => setTopK(Number(e.target.value))}>
              {[3, 5, 8, 10].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
          </div>

          {/* Stream toggle */}
          <button
            onClick={() => setStreamMode(s => !s)}
            className="btn btn-sm"
            style={{
              background: streamMode ? 'rgba(16,185,129,0.12)' : '#1e293b',
              color: streamMode ? '#34d399' : '#64748b',
              border: `1px solid ${streamMode ? 'rgba(16,185,129,0.3)' : '#334155'}`,
            }}
          >
            <span className={`status-dot ${streamMode ? 'green' : 'slate'}`} />
            Streaming {streamMode ? 'ON' : 'OFF'}
          </button>

          {/* Clear */}
          <button onClick={clearChat} className="btn btn-ghost btn-sm btn-icon" title="Clear conversation">
            <Refresh size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, margin: '0 auto' }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} style={{ display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isUser ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#1a2338',
                  border: isUser ? 'none' : '1px solid #1e293b',
                }}>
                  {isUser
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>You</span>
                    : <Brain size={16} color="#818cf8" />}
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, maxWidth: 'calc(100% - 46px)' }}>
                  <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
                    {msg.content}
                    {msg.isStreaming && (
                      <span style={{ display: 'inline-block', width: 8, height: 16, background: '#818cf8', marginLeft: 4, verticalAlign: 'middle', animation: 'pulse 0.8s ease-in-out infinite' }} />
                    )}
                  </div>

                  {/* Copy + Sources */}
                  {!isUser && msg.content && !msg.isStreaming && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => copy(msg.content, idx)} className="btn btn-ghost btn-sm"
                        style={{ fontSize: 12, padding: '4px 8px', color: '#475569' }}>
                        {copiedIdx === idx ? <><Check size={12} color="#34d399" /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                      {msg.sources?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {msg.sources.map((s, si) => (
                            <span key={si} className="badge badge-blue" style={{ fontSize: 11 }}>
                              [{s.sourceNumber || si + 1}] {(s.documentName || 'Doc').slice(0, 25)}
                              {s.score !== undefined && <span style={{ opacity: 0.6 }}> {s.score.toFixed(2)}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Stream status */}
          {streamStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#818cf8', paddingLeft: 46 }}>
              <span className="spinner" style={{ width: 12, height: 12, borderColor: 'rgba(129,140,248,0.2)', borderTopColor: '#818cf8' }} />
              {streamStatus}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Suggestions (shown when only greeting) ── */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} className="btn btn-secondary btn-sm"
              style={{ fontSize: 12 }}>
              <Sparkles size={12} color="#fbbf24" /> {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="card" style={{ padding: '10px 10px 10px 16px', flexShrink: 0 }}>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Ask a question about your documents… (Enter to send, Shift+Enter for newline)"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit',
              lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', padding: '8px 0',
            }}
          />
          <button type="submit" disabled={!input.trim() || loading} className="btn btn-primary btn-icon"
            style={{ width: 42, height: 42, flexShrink: 0 }}>
            {loading ? <span className="spinner spinner-sm" /> : <Send size={16} />}
          </button>
        </form>
      </div>

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />}
    </div>
  );
};
