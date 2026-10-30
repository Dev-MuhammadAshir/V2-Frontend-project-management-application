import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskSeverityBadge } from '../components/common/Badge';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Filter,
  Wrench,
  Users,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { RiskType, LikelihoodLevel, ImpactLevel } from '../types';

export const PIRAERiskDashboard: React.FC = () => {
  const { risks, openRiskModal, resolveRisk, projects } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedCell, setSelectedCell] = useState<{ likelihood: LikelihoodLevel; impact: ImpactLevel } | null>(null);

  const activeRisks = risks.filter(r => r.status === 'OPEN' || r.status === 'IN_REVIEW');
  const criticalCount = activeRisks.filter(r => r.severity === 'CRITICAL').length;
  const highCount = activeRisks.filter(r => r.severity === 'HIGH').length;
  const moderateCount = activeRisks.filter(r => r.severity === 'MODERATE').length;
  const lowCount = activeRisks.filter(r => r.severity === 'LOW').length;

  const filteredRisks = activeRisks.filter(r => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (selectedCell) {
      if (r.likelihood !== selectedCell.likelihood || r.impact !== selectedCell.impact) return false;
    }
    return true;
  });

  // Heatmap matrix 3x3 definition
  const likelihoods: LikelihoodLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
  const impacts: ImpactLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

  // Helper to get color for cell in 3x3
  const getCellBg = (l: LikelihoodLevel, i: ImpactLevel) => {
    if (l === 'HIGH' && i === 'HIGH') return 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300';
    if ((l === 'HIGH' && i === 'MEDIUM') || (l === 'MEDIUM' && i === 'HIGH')) return 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200';
    if ((l === 'HIGH' && i === 'LOW') || (l === 'MEDIUM' && i === 'MEDIUM') || (l === 'LOW' && i === 'HIGH')) return 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              PIRAE Risk Assessment Engine (S-27)
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 font-mono">
              Intelligence v3.0 Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Project Intelligence & Risk Assessment Engine: Predictive schedule slip, over-allocation, and dependency bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Risk Types</option>
            <option value="RESOURCE_OVERLOAD">Resource Overload</option>
            <option value="DEPENDENCY_BLOCK">Dependency Block</option>
            <option value="SCHEDULE_SLIP">Schedule Slip</option>
            <option value="SCOPE_CREEP">Scope Creep</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Active Risks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{activeRisks.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Across all projects</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-rose-700 block mb-1">Critical Severity (≥75)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">{criticalCount}</span>
            <span className="text-[11px] text-rose-500 font-medium">Immediate action</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-amber-700 block mb-1">High Severity (50-74)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">{highCount}</span>
            <span className="text-[11px] text-amber-500 font-medium">Sprint mitigation</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Moderate / Low</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{moderateCount + lowCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Under observation</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Risk Heatmap (3x3 Matrix) & Top Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 3x3 Heatmap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Risk Heatmap Matrix (3x3)
              </h3>
              {selectedCell && (
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive Likelihood vs Impact. Click any quadrant to isolate.
            </p>
          </div>

          <div className="relative pt-2">
            {/* Y-axis label */}
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Likelihood
            </div>

            <div className="ml-4 space-y-2">
              {likelihoods.map(lik => (
                <div key={lik} className="flex items-center gap-2">
                  <span className="w-12 text-[10px] font-mono text-slate-500 font-bold">{lik}</span>
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {impacts.map(imp => {
                      const matching = activeRisks.filter(r => r.likelihood === lik && r.impact === imp);
                      const isSelected = selectedCell?.likelihood === lik && selectedCell?.impact === imp;

                      return (
                        <button
                          key={imp}
                          type="button"
                          onClick={() =>
                            setSelectedCell(isSelected ? null : { likelihood: lik, impact: imp })
                          }
                          className={`h-12 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${getCellBg(
                            lik,
                            imp
                          )} ${isSelected ? 'ring-2 ring-blue-600 scale-102 shadow-xs' : ''}`}
                        >
                          <span className="text-xs font-extrabold font-mono tabular-nums">
                            {matching.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* X-axis labels */}
              <div className="flex items-center gap-2 pt-1">
                <span className="w-12"></span>
                <div className="grid grid-cols-3 gap-2 flex-1 text-center text-[10px] font-mono text-slate-400 font-bold uppercase">
                  <span>Low</span>
                  <span>Med</span>
                  <span>High</span>
                </div>
              </div>
              <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                Impact →
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex justify-between">
            <span>Critical Zone: High × High</span>
            <span>Safety Zone: Low × Low</span>
          </div>
        </div>

        {/* Right: Top Risk Factors & Root Causes */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Detected Risk Factors & Heuristics
            </h3>
            <span className="text-xs font-mono text-slate-400">PIRAE Autodetect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Users className="w-4 h-4" />
                <span>Resource Over-Allocation</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Priya Sharma assigned 42h (120% nominal limit). High fatigue & defect risk detected.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>External Quota Block</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                AWS RDS cloud quota delay stalls Kafka consumer integration (PRF-102).
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <Layers className="w-4 h-4" />
                <span>Accessibility Slip</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                WCAG 2.2 form pass trailing sprint completion milestone by 2.4 days.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Automated Rebalancing</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Heuristic engine recommends reallocating 10h virtualization task to Liam Henderson.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Cards List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Active Identified Risk Items ({filteredRisks.length})
        </h3>

        {filteredRisks.map(risk => {
          const project = projects.find(p => p.id === risk.projectId);

          return (
            <div
              key={risk.id}
              onClick={() => openRiskModal(risk.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-red-400 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-lg bg-red-50 text-red-600 shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RiskSeverityBadge severity={risk.severity} />
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {risk.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">· {project?.title}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {risk.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
                    {risk.reason}
                  </p>
                </div>
              </div>

              {/* Right: Score + Mitigate button */}
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-rose-600 tabular-nums">
                    {risk.score}/100
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Likelihood: {risk.likelihood}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      resolveRisk(risk.id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
                  >
                    Mitigate
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openRiskModal(risk.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
