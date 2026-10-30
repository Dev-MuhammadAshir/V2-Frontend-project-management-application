import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Users, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { tasks, users, projects, risks } = useApp();

  // 1. Task Status distribution
  const statusCounts = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'TODO').length, color: '#94A3B8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#2563EB' },
    { name: 'Done', value: tasks.filter(t => t.status === 'DONE').length, color: '#16A34A' }
  ];

  // 2. Priority distribution
  const priorityData = [
    { priority: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, fill: '#10B981' },
    { priority: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, fill: '#F59E0B' },
    { priority: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, fill: '#F43F5E' },
    { priority: 'Critical', count: tasks.filter(t => t.priority === 'CRITICAL').length, fill: '#DC2626' }
  ];

  // 3. Workload per member
  const memberWorkload = users.map(u => {
    const assignedHours = tasks
      .filter(t => t.assigneeId === u.id && t.status !== 'DONE')
      .reduce((acc, curr) => acc + curr.estimatedHours, 0);

    return {
      name: u.name.split(' ')[0],
      assigned: assignedHours,
      capacity: u.capacityHours,
      isOverloaded: assignedHours > u.capacityHours
    };
  });

  // 4. Sprint velocity trend (mock historical points)
  const velocityTrend = [
    { sprint: 'Sprint 23', committed: 45, completed: 42 },
    { sprint: 'Sprint 24', committed: 50, completed: 48 },
    { sprint: 'Sprint 25', committed: 55, completed: 51 },
    { sprint: 'Sprint 26', committed: 60, completed: 58 },
    { sprint: 'Sprint 27', committed: 65, completed: 44 } // current active
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Platform Analytics & Velocity Dashboard (S-21)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time throughput metrics, resource load distribution, and sprint burn rates
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Velocity: 52 pts / sprint</span>
        </div>
      </div>

      {/* Grid 1: Status Donut & Priority Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Task Status Breakdown (Donut)
            </h3>
            <span className="text-xs font-mono text-slate-400">{tasks.length} total tasks</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} tasks`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {statusCounts.map(item => (
              <div key={item.name} className="p-1">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[11px] text-slate-500">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tasks by Priority Level
            </h3>
            <span className="text-xs font-mono text-slate-400">Heuristic Severity</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="priority" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
            Critical tasks trigger priority alarms in PIRAE risk mitigation queue.
          </p>
        </div>
      </div>

      {/* Grid 2: Workload per Member (Capacity vs Assigned) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Workload per Team Member (Assigned vs Nominal Capacity)
            </h3>
          </div>
          <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>PIRAE Overload Threshold: &gt;100%</span>
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberWorkload}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" fontSize={11} stroke="#64748B" />
              <YAxis fontSize={11} stroke="#64748B" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="assigned" name="Assigned Task Hours" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Nominal Weekly Capacity" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 3: Sprint Velocity & Burn trend */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Sprint Velocity & Milestone Trend
          </h3>
          <span className="text-xs font-mono text-slate-400">Story Points Committed vs Completed</span>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={velocityTrend}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="sprint" fontSize={11} stroke="#64748B" />
              <YAxis fontSize={11} stroke="#64748B" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
              />
              <Area type="monotone" dataKey="completed" stroke="#2563EB" fillOpacity={1} fill="url(#colorComp)" name="Points Delivered" />
              <Area type="monotone" dataKey="committed" stroke="#94A3B8" strokeDasharray="4 4" fill="transparent" name="Committed Scope" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
