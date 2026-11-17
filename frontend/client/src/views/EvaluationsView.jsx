import React, { useState } from 'react';
import { api } from '../services/api';
import { Toast } from '../components/Toast';
import {
  IconBarChart,
  IconPlay,
  IconCheckCircle,
  IconAlertCircle,
  IconActivity,
  IconShield,
  IconSparkles
} from '../components/Icons';

export const EvaluationsView = () => {
  const [k, setK] = useState(5);
  const [running, setRunning] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const handleRunEvaluation = async (e) => {
    e?.preventDefault();
    if (running) return;

    setRunning(true);
    setEvaluationData(null);

    try {
      const res = await api.evaluations.run({ k });
      if (res.success && res.data) {
        setEvaluationData(res.data);
        setToast({
          message: 'Evaluation suite benchmark completed successfully!',
          type: 'success'
        });
      } else {
        throw new Error(res.message || 'Evaluation run failed');
      }
    } catch (err) {
      setToast({
        message: err.message || 'Evaluation run failed. Only users with role ADMIN can run benchmarks.',
        type: 'error'
      });
    } finally {
      setRunning(false);
    }
  };

  const formatPercentage = (val) => {
    if (val === null || val === undefined) return 'N/A';
    return (val * 100).toFixed(1) + '%';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <IconBarChart size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>RAG Benchmark & Evaluation Suite</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                ADMIN ACCESS
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Automated end-to-end evaluation calculating Recall@K, MRR, Faithfulness, and Answer Relevance.
            </p>
          </div>
        </div>
      </div>

      {/* Control Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Execution Parameters</h3>
            <p className="text-xs text-slate-400">
              Run evaluation against the standard enterprise test dataset with configurable top-K retrieval depth.
            </p>
          </div>

          <form onSubmit={handleRunEvaluation} className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Top-K Depth:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={running}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
            >
              {running ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Dataset...</span>
                </>
              ) : (
                <>
                  <IconPlay size={14} />
                  <span>Run Benchmark Suite</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Evaluation Results */}
      {evaluationData && (
        <div className="space-y-6 animate-slide-up">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Recall @ K ({k})</span>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                {formatPercentage(evaluationData.metrics?.recallAtK)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Fraction of relevant chunks retrieved</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">MRR (Mean Reciprocal Rank)</span>
              <h3 className="text-2xl font-black text-cyan-400 mt-1">
                {evaluationData.metrics?.mrr !== undefined
                  ? evaluationData.metrics.mrr.toFixed(3)
                  : 'N/A'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Rank position of first relevant result</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Answer Faithfulness</span>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                {formatPercentage(evaluationData.metrics?.faithfulness)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Grounded without hallucination</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Answer Relevance</span>
              <h3 className="text-2xl font-black text-violet-400 mt-1">
                {formatPercentage(evaluationData.metrics?.answerRelevance)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Directly addresses user intent</p>
            </div>

          </div>

          {/* Test Cases Table */}
          {evaluationData.results && evaluationData.results.length > 0 && (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <IconActivity size={18} className="text-amber-400" />
                  <span>Test Case Analysis ({evaluationData.results.length} tests)</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Test Query</th>
                      <th className="py-3 px-4">Recall@K</th>
                      <th className="py-3 px-4">Faithful</th>
                      <th className="py-3 px-4">Relevant</th>
                      <th className="py-3 px-4">Evaluator Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {evaluationData.results.map((t, idx) => (
                      <tr key={t.testId || idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white max-w-xs">
                          {t.query}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-cyan-400">
                          {t.retrievalMetrics?.recallAtK !== undefined
                            ? (t.retrievalMetrics.recallAtK * 100).toFixed(0) + '%'
                            : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.answerMetrics?.faithful ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <IconCheckCircle size={14} /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                              <IconAlertCircle size={14} /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.answerMetrics?.relevance ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <IconCheckCircle size={14} /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                              <IconAlertCircle size={14} /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-sm">
                          {t.answerMetrics?.reason || 'Verified'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Toast notifications */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      )}

    </div>
  );
};
