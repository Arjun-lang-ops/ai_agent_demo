import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Brain, Bot, Database, Search, Sparkles, Network, BarChart,
  LogOut, Refresh, Building, Shield, User, AlertCircle
} from './Icons';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',      Icon: Sparkles,  color: '#818cf8' },
  { id: 'knowledge',   label: 'Knowledge Base',  Icon: Database,  color: '#34d399' },
  { id: 'rag',         label: 'RAG Studio',      Icon: Brain,     color: '#60a5fa' },
  { id: 'agents',      label: 'Multi-Agent',     Icon: Bot,       color: '#a78bfa' },
  { id: 'search',      label: 'Search Explorer', Icon: Search,    color: '#22d3ee' },
  { id: 'mcp',         label: 'MCP Tools',       Icon: Network,   color: '#4ade80' },
];

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, tenant, backendStatus, logout, retryConnection, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isAdmin
    ? [...NAV_ITEMS, { id: 'evaluations', label: 'Evaluations', Icon: BarChart, color: '#fbbf24' }]
    : NAV_ITEMS;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(11,15,26,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e293b',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 60, gap: 16 }}>

          {/* ── Logo ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
                Enterprise AI
              </div>
              <div style={{ fontSize: 10, color: '#4f46e5', fontWeight: 600, marginTop: -1 }}>
                RAG · Agents · MCP
              </div>
            </div>
          </div>

          {/* ── Desktop Nav ── */}
          <nav style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}
               className="hide-scrollbar">
            {navItems.map(({ id, label, Icon, color }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 8,
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? '#f1f5f9' : '#64748b',
                    background: active ? 'rgba(79,70,229,0.18)' : 'transparent',
                    border: active ? '1px solid rgba(79,70,229,0.35)' : '1px solid transparent',
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = '#1e293b'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  <Icon size={15} color={active ? color : 'currentColor'} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* ── Right Side ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

            {/* Backend Status Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: backendStatus === 'connected' ? 'rgba(16,185,129,0.1)' :
                          backendStatus === 'checking'  ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
              color:      backendStatus === 'connected' ? '#34d399' :
                          backendStatus === 'checking'  ? '#fbbf24' : '#f87171',
              border: `1px solid ${backendStatus === 'connected' ? 'rgba(16,185,129,0.25)' :
                                   backendStatus === 'checking'  ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              <span className={`status-dot ${backendStatus === 'connected' ? 'green' : backendStatus === 'checking' ? 'amber' : 'red'}`} />
              <span style={{ display: 'none' }} className="sm-show">
                {backendStatus === 'connected' ? 'Live' : backendStatus === 'checking' ? 'Checking…' : 'Offline'}
              </span>
              {backendStatus === 'disconnected' && (
                <button
                  onClick={retryConnection}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}
                  title="Retry connection"
                >
                  <Refresh size={12} />
                </button>
              )}
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #1e293b' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={16} color="#818cf8" />
              </div>
              <div style={{ lineHeight: 1.3, display: 'none' }} className="lg-show">
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {user?.fullname || 'User'}
                  {isAdmin && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, background: 'rgba(245,158,11,0.15)',
                      color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)',
                      padding: '1px 5px', borderRadius: 4
                    }}>ADMIN</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building size={10} color="#475569" />
                  {tenant?.name || 'Organization'}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-ghost btn-icon"
                title="Sign out"
                style={{ color: '#64748b' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive hide/show helpers via inline styles */}
      <style>{`
        @media (max-width: 640px) { .sm-show { display: none !important; } }
        @media (min-width: 640px) { .sm-show { display: inline !important; } }
        @media (max-width: 1024px) { .lg-show { display: none !important; } }
        @media (min-width: 1024px) { .lg-show { display: flex !important; flex-direction: column; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </header>
  );
};
