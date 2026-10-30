import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Sliders, Shield, Save, RotateCcw } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, currentUser } = useApp();

  const [criticalThreshold, setCriticalThreshold] = useState(settings.riskThresholdCritical);
  const [highThreshold, setHighThreshold] = useState(settings.riskThresholdHigh);
  const [sprintDays, setSprintDays] = useState(settings.defaultSprintDays);
  const [maxCapacity, setMaxCapacity] = useState(settings.maxCapacityHours);
  const [retentionDays, setRetentionDays] = useState(settings.auditRetentionDays);
  const [emailAlerts, setEmailAlerts] = useState(settings.emailAlerts);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      riskThresholdCritical: Number(criticalThreshold),
      riskThresholdHigh: Number(highThreshold),
      defaultSprintDays: Number(sprintDays),
      maxCapacityHours: Number(maxCapacity),
      auditRetentionDays: Number(retentionDays),
      emailAlerts
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Workspace & PIRAE Engine Configuration (S-29)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fine-tune risk calculation algorithms, sprint durations, and audit storage limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 font-mono">
            {currentUser.role} ACCESS
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* PIRAE Risk Engine Rules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-rose-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">PIRAE Intelligence Thresholds</h3>
              <p className="text-xs text-slate-500">
                Determines when heuristic risk alarms trigger automated project alerts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Critical Risk Alarm Threshold (Score 1-100)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={criticalThreshold}
                  onChange={e => setCriticalThreshold(Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">Score &ge; {criticalThreshold} flags urgent intervention</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                High Risk Warning Threshold (Score 1-100)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={30}
                  max={70}
                  value={highThreshold}
                  onChange={e => setHighThreshold(Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">Score &ge; {highThreshold} triggers sprint review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sprint & Capacity Governance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sprint & Capacity Policies</h3>
              <p className="text-xs text-slate-500">
                Nominal work capacity parameters used to detect engineer fatigue and burnout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Sprint Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={7}
                  max={30}
                  value={sprintDays}
                  onChange={e => setSprintDays(Number(e.target.value))}
                  className="w-20 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                />
                <span className="text-slate-500 font-mono">days</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nominal Weekly Capacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={60}
                  value={maxCapacity}
                  onChange={e => setMaxCapacity(Number(e.target.value))}
                  className="w-20 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                />
                <span className="text-slate-500 font-mono">hrs/week</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Log Retention</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={365}
                  value={retentionDays}
                  onChange={e => setRetentionDays(Number(e.target.value))}
                  className="w-20 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none"
                />
                <span className="text-slate-500 font-mono">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Personal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">System Notification Routing</h3>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-semibold text-slate-800">Dispatch Instant Email Digests for Critical Risks</p>
              <p className="text-[11px] text-slate-500">
                Notify project leads and engineering managers whenever a task is blocked &gt;24h
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
