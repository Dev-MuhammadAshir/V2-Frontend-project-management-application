import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { StatSkeleton } from '../components/common/SkeletonLoader';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import {
  CheckSquare,
  AlertTriangle,
  FolderKanban,
  Clock,
  ArrowRight,
  ShieldAlert,
  Kanban,
  Users,
  Activity,
  PlusCircle,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    tasks,
    projects,
    risks,
    activities,
    isSimulatedLoading,
    openTaskDrawer,
    openRiskModal,
    moveTaskStatus,
    liveFlashKey
  } = useApp();

  const navigate = useNavigate();

  if (isSimulatedLoading) {
    return (
      <div className="space-y-6">
        <StatSkeleton />
        <div className="h-64 bg-white rounded-lg border border-slate-200 animate-pulse"></div>
      </div>
    );
  }

  // Compute metrics
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myOpenTasks = myTasks.filter(t => t.status !== 'DONE');
  const now = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.dueDate < now && t.status !== 'DONE');
  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const criticalRisks = risks.filter(r => r.status === 'OPEN' && (r.severity === 'CRITICAL' || r.severity === 'HIGH'));

  // Workload calculation
  const capacityUsedPercent = Math.min(
    100,
    Math.round((currentUser.assignedHours / currentUser.capacityHours) * 100)
  );

  // Status breakdown data for donut chart
  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  const chartData = [
    { name: 'To Do', value: todoCount, color: '#94A3B8' },
    { name: 'In Progress', value: inProgressCount, color: '#2563EB' },
    { name: 'Done', value: doneCount, color: '#16A34A' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating as <span className="font-semibold text-slate-700">{currentUser.role}</span> in {currentUser.department} · {currentUser.timeZone}
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/kanban')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5 text-blue-600" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => navigate('/risks')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>PIRAE Risks ({criticalRisks.length})</span>
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
            <span>Projects</span>
          </button>
        </div>
      </div>

      {/* PIRAE Critical Risk Alert (If any) */}
      {criticalRisks.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  PIRAE Risk Intelligence Alert
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white">
                  {criticalRisks[0].score}/100 SCORE
                </span>
              </div>
              <p className="text-xs font-semibold text-rose-800 mt-1">
                {criticalRisks[0].title}
              </p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                {criticalRisks[0].reason}
              </p>
            </div>
          </div>
          <button
            onClick={() => openRiskModal(criticalRisks[0].id)}
            className="px-3 py-1.5 text-xs font-medium text-rose-800 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            Review Mitigation
          </button>
        </div>
      )}

      {/* Stat Cards (SRS S-17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Open Tasks */}
        <div
          onClick={() => navigate('/my-tasks')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">My Open Tasks</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {myOpenTasks.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {myTasks.length} total assigned
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-blue-600 font-medium">
            <span>View task backlog</span>
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Overdue Tasks */}
        <div
          onClick={() => navigate('/tasks')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-red-400 transition-all shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Overdue Deliverables</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono tabular-nums ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueTasks.length}
            </span>
            <span className="text-[11px] text-slate-400">Past target date</span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-slate-500 font-medium">
            <span>Filter overdue items</span>
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Active Projects */}
        <div
          onClick={() => navigate('/projects')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Projects</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {activeProjects.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Avg 62% progress
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-indigo-600 font-medium">
            <span>Browse portfolio</span>
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Workload Capacity Gauge */}
        <div
          onClick={() => navigate('/profile')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-400 transition-all shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">My Weekly Capacity</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentUser.assignedHours}h
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              of {currentUser.capacityHours}h nominal
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                capacityUsedPercent > 100
                  ? 'bg-rose-500'
                  : capacityUsedPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(capacityUsedPercent, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{capacityUsedPercent}% committed</span>
            <span className="text-emerald-700 font-medium">Adjust</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Task Status Donut & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (1 col): Sprint Task Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Task Status Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">{tasks.length} total</span>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} tasks`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-slate-900">{tasks.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">TASKS</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            {chartData.map(d => (
              <div key={d.name} className="p-1 rounded">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[11px] text-slate-500 font-medium">{d.name}</span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right (2 cols): Real-Time Activity Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Real-Time Team Activity Stream
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Live WebSockets Syncing</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-1">
            {activities.slice(0, 5).map(act => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/80 transition-colors text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-slate-800 leading-snug">
                      <span className="font-semibold text-slate-900">{currentUser.name}</span>{' '}
                      <span className="text-slate-600">{act.action}</span>{' '}
                      <span className="font-semibold text-blue-600 truncate">{act.target}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Backlog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              High Priority Sprint Focus
            </h3>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({tasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-2.5">Key</th>
                <th className="px-4 py-2.5">Task Title</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.slice(0, 5).map(task => {
                const isOverdue = task.dueDate < now && task.status !== 'DONE';
                const isFlashing = liveFlashKey === task.id;

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isFlashing ? 'animate-live-flash' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500">
                      {task.key}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div
                        onClick={() => openTaskDrawer(task.id)}
                        className="cursor-pointer hover:text-blue-600 transition-colors truncate max-w-md"
                      >
                        {task.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} isBlocked={task.isBlocked} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                        {task.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openTaskDrawer(task.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
