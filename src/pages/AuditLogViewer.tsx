import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Search, Filter, ShieldCheck, Eye, X } from 'lucide-react';
import { AuditLog, AuditSeverity } from '../types';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs, users } = useApp();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.entityName.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'ActorId', 'Action', 'EntityType', 'EntityName', 'Severity'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.actorId,
      l.action,
      l.entityType,
      `"${l.entityName.replace(/"/g, '""')}"`,
      l.severity
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `projectflow_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Immutable Audit Trail (S-26)
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
              SOC2 & HIPAA Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Cryptographically logged mutations, permission changes, and PIRAE heuristics
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action or target..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities ({auditLogs.length})</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Timestamp (UTC)</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target Entity</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3 text-right">Payload Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => {
              const actor = users.find(u => u.id === log.actorId);

              let badgeClass = 'bg-slate-100 text-slate-700';
              if (log.severity === 'CRITICAL') badgeClass = 'bg-rose-100 text-rose-800 font-bold';
              else if (log.severity === 'WARNING') badgeClass = 'bg-amber-100 text-amber-800 font-semibold';

              return (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {actor && (
                        <img src={actor.avatar} alt={actor.name} className="w-5 h-5 rounded-full object-cover" />
                      )}
                      <span className="font-semibold text-slate-900">{actor?.name || log.actorId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800 text-[11px]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">{log.entityName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">({log.entityType})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${badgeClass}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Diff Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedLog.action}</h3>
                <span className="text-xs text-slate-500 font-mono">{selectedLog.entityName}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Previous State (Old Values)
                </span>
                <pre className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] overflow-x-auto text-slate-700">
                  {selectedLog.oldValues ? JSON.stringify(selectedLog.oldValues, null, 2) : 'None (Created entity)'}
                </pre>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Mutated State (New Values)
                </span>
                <pre className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 font-mono text-[11px] overflow-x-auto text-emerald-900">
                  {selectedLog.newValues ? JSON.stringify(selectedLog.newValues, null, 2) : 'None (Deleted entity)'}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Close Diff Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
