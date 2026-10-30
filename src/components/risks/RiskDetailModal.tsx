import React from 'react';
import { useApp } from '../../context/AppContext';
import { RiskSeverityBadge } from '../common/Badge';
import { ShieldAlert, X, CheckCircle, Clock, AlertTriangle, ArrowRight, UserCheck, Wrench } from 'lucide-react';

export const RiskDetailModal: React.FC = () => {
  const {
    activeRiskModalId,
    closeRiskModal,
    risks,
    resolveRisk,
    dismissRisk,
    tasks,
    users,
    projects,
    openTaskDrawer
  } = useApp();

  const risk = risks.find(r => r.id === activeRiskModalId);
  const project = projects.find(p => p.id === risk?.projectId);

  if (!risk) return null;

  const affectedTasks = tasks.filter(t => risk.affectedTaskIds.includes(t.id));
  const affectedMembers = users.filter(u => risk.affectedMemberIds.includes(u.id));

  // Determine gauge color
  let scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (risk.score >= 75) {
    scoreColor = 'text-red-600 bg-red-50 border-red-200';
  } else if (risk.score >= 50) {
    scoreColor = 'text-amber-600 bg-amber-50 border-amber-200';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <RiskSeverityBadge severity={risk.severity} />
                <span className="text-xs font-mono text-slate-500 uppercase">{risk.type.replace('_', ' ')}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">{risk.title}</h2>
            </div>
          </div>
          <button
            onClick={closeRiskModal}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${scoreColor}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">Risk Score</span>
              <span className="text-3xl font-extrabold font-mono tabular-nums my-1">{risk.score}</span>
              <span className="text-[10px] opacity-80">Out of 100</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Likelihood</span>
              <span className="text-lg font-bold text-slate-800 my-1">{risk.likelihood}</span>
              <span className="text-[10px] text-slate-400">Probability tier</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Impact</span>
              <span className="text-lg font-bold text-slate-800 my-1">{risk.impact}</span>
              <span className="text-[10px] text-slate-400">Severity tier</span>
            </div>
          </div>

          {/* Root Cause & Heuristics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Root Cause & Detection Heuristics</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 text-xs text-slate-800 leading-relaxed">
              {risk.reason}
            </div>
          </div>

          {/* PIRAE AI Engine Recommendation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Automated Mitigation Recommendation</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-200 text-xs text-slate-800 leading-relaxed font-medium">
              {risk.recommendation}
            </div>
          </div>

          {/* Affected Personnel */}
          {affectedMembers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Affected Team Members ({affectedMembers.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {affectedMembers.map(m => (
                  <div key={m.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-2.5">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{m.name}</p>
                      <p className="text-[11px] text-rose-600 font-mono">
                        {m.assignedHours}h assigned / {m.capacityHours}h capacity
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affected Tasks */}
          {affectedTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Impacted Sprint Tasks ({affectedTasks.length})</span>
              </h4>
              <div className="space-y-1.5">
                {affectedTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      closeRiskModal();
                      openTaskDrawer(t.id);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 flex items-center justify-between text-xs cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-semibold text-slate-400">{t.key}</span>
                      <span className="font-medium text-slate-800 truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">{t.status}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Detected: {new Date(risk.detectedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2.5">
            {risk.status === 'OPEN' && (
              <button
                onClick={() => {
                  dismissRisk(risk.id);
                  closeRiskModal();
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                Dismiss Risk
              </button>
            )}
            {risk.status !== 'MITIGATED' ? (
              <button
                onClick={() => {
                  resolveRisk(risk.id);
                  closeRiskModal();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Mitigated</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Mitigated
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
