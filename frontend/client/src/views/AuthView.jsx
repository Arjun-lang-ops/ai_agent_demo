import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, CheckCircle, AlertCircle, Shield, Sparkles, Refresh } from '../components/Icons';

export const AuthView = () => {
  const { login, register, backendStatus, retryConnection } = useAuth();
  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!fullname.trim() || !companyName.trim())
          throw new Error('Full name and company name are required.');
        await register({ fullname, email, password, companyName });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setMode('register');
    setFullname('Demo Admin');
    setEmail('admin@demo.ai');
    setPassword('Demo@12345!');
    setCompanyName('Demo Corp AI');
  };

  const FEATURES = [
    'Multi-tenant document isolation per company',
    'PDF, DOCX, TXT document ingestion pipeline',
    'Hybrid vector + keyword search (BM25)',
    'Real-time streaming RAG with source citations',
    'LangGraph multi-agent reasoning with guardrails',
    'Model Context Protocol (MCP) tool integration',
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, background: 'radial-gradient(ellipse at 20% 30%, rgba(79,70,229,0.12) 0%, transparent 60%), #0b0f1a',
    }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 0, borderRadius: 20, overflow: 'hidden', border: '1px solid #1e293b', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

        {/* ── Left Panel ── */}
        <div style={{
          padding: '40px 36px',
          background: 'linear-gradient(145deg, #0d1526 0%, #111827 100%)',
          borderRight: '1px solid #1e293b',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
            }}>
              <Brain size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#f1f5f9' }}>Enterprise AI Platform</div>
              <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 500 }}>Agentic RAG System</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
            A production-grade knowledge platform powered by Gemini 2.5 Flash, LangGraph, MongoDB Atlas Vector Search, and Model Context Protocol.
          </p>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                <CheckCircle size={15} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
                {f}
              </div>
            ))}
          </div>

          {/* Quick-fill Demo */}
          <button onClick={fillDemo} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Sparkles size={13} color="#fbbf24" />
            Fill demo credentials
          </button>
        </div>

        {/* ── Right Panel: Form ── */}
        <div style={{ padding: '40px 36px', background: '#111827', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>

          {/* Backend offline warning */}
          {backendStatus === 'disconnected' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 12, color: '#fca5a5',
            }}>
              <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Backend offline. Start it with <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: 4 }}>npm run dev</code></span>
              <button onClick={retryConnection} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 10px' }}>
                <Refresh size={12} /> Retry
              </button>
            </div>
          )}

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#0d1526', borderRadius: 10, padding: 4, border: '1px solid #1e293b' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: mode === m ? 'linear-gradient(135deg, #4f46e5, #6d28d9)' : 'transparent',
                  color: mode === m ? '#fff' : '#64748b',
                  boxShadow: mode === m ? '0 2px 10px rgba(79,70,229,0.4)' : 'none',
                }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
            </h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#64748b' }}>
              {mode === 'login'
                ? 'Sign in to access your documents, agents, and RAG studio.'
                : "Register a new organization. You will be the admin."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
              borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              fontSize: 13, color: '#fca5a5',
            }}>
              <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="label">Company / Organization</label>
                  <input className="input" type="text" required value={companyName}
                    onChange={e => setCompanyName(e.target.value)} placeholder="Acme Technologies Ltd" />
                </div>
                <div>
                  <label className="label">Your Full Name</label>
                  <input className="input" type="text" required value={fullname}
                    onChange={e => setFullname(e.target.value)} placeholder="Jane Smith" />
                </div>
              </>
            )}
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••••" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? <><span className="spinner" />&nbsp;Processing…</> :
                mode === 'login' ? 'Sign In to Workspace' : 'Create Organization & Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#475569', marginTop: -8 }}>
            <Shield size={12} color="#475569" />
            JWT Authentication · Multi-Tenant Isolation · End-to-End Security
          </div>
        </div>
      </div>
    </div>
  );
};
