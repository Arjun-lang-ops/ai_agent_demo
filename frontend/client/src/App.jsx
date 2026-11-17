import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { RagStudioView } from './views/RagStudioView';
import { MultiAgentView } from './views/MultiAgentView';
import { SearchExplorerView } from './views/SearchExplorerView';
import { McpToolsView } from './views/McpToolsView';
import { EvaluationsView } from './views/EvaluationsView';
import { IconBrain } from './components/Icons';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/20 flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <IconBrain className="text-cyan-400" size={26} />
          </div>
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-400 flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
          <span>Initializing Enterprise AI Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'knowledge' && <KnowledgeBaseView />}
        {activeTab === 'rag' && <RagStudioView />}
        {activeTab === 'agents' && <MultiAgentView />}
        {activeTab === 'search' && <SearchExplorerView />}
        {activeTab === 'mcp' && <McpToolsView />}
        {activeTab === 'evaluations' && <EvaluationsView />}
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        Enterprise AI Platform &bull; Multi-Tenant RAG &bull; Gemini 2.5 Flash &bull; LangGraph Agents
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
