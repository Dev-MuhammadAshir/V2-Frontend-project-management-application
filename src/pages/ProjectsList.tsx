import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge, ProjectStatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CardGridSkeleton } from '../components/common/SkeletonLoader';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Calendar,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Users,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Project } from '../types';

export const ProjectsList: React.FC = () => {
  const { projects, teams, users, risks, isSimulatedLoading } = useApp();
  const { can } = useMockAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isSimulatedLoading) {
    return <CardGridSkeleton count={4} />;
  }

  const filteredProjects = projects.filter(p => {
    // Normalize status matching
    if (statusFilter !== 'ALL') {
      const pStatus = p.status.toUpperCase();
      const fStatus = statusFilter.toUpperCase();
      if (pStatus !== fStatus && !pStatus.includes(fStatus)) {
        return false;
      }
    }
    // Priority filter
    if (priorityFilter !== 'ALL' && p.priority !== priorityFilter) {
      return false;
    }
    // Team filter
    if (teamFilter !== 'ALL' && p.teamId !== teamFilter) {
      return false;
    }
    // Search query (key or title)
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchKey = (p.key || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchKey && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Filters Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Projects Portfolio (S-08)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage engineering initiatives, milestones, team assignments, and PIRAE risk exposure
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Grid / List toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Table View"
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create Project Button (RBAC: Admin & PM only) */}
            {can('create_project') && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, key (PRF-1), description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="OnHold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Team filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-medium text-slate-400">Team:</span>
            <select
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || teamFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setTeamFilter('ALL');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Content */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match criteria"
          description="Try adjusting your active filters or create a new engineering initiative."
          actionText={can('create_project') ? "Create Project" : undefined}
          onAction={can('create_project') ? () => setIsCreateOpen(true) : undefined}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredProjects.map(project => {
            const team = teams.find(t => t.id === project.teamId);
            const lead = users.find(u => u.id === project.leadId);
            const activeRisks = risks.filter(r => r.projectId === project.id && r.status !== 'Resolved' && r.status !== 'MITIGATED' && r.status !== 'DISMISSED');
            const targetDate = project.dueDate || project.deadline;

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Key, Status, Priority */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {project.key}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <ProjectStatusBadge status={project.status} />
                      <PriorityBadge priority={project.priority} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Delivery Progress</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* KPI Chips */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Budget Spend</span>
                      <span className="font-mono font-semibold text-slate-800">
                        ${project.spent?.toLocaleString() || '0'} / ${project.budget?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Tasks Ratio</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {project.completedTasksCount} done / {project.openTasksCount + project.completedTasksCount} total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Left: Lead and Team */}
                  <div className="flex items-center gap-2">
                    {lead && (
                      <img
                        src={lead.avatar}
                        alt={lead.name}
                        title={`Lead: ${lead.name}`}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                    )}
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[130px]">
                      {team?.name || 'Assigned Pod'}
                    </span>
                  </div>

                  {/* Right: Due Date & PIRAE risks */}
                  <div className="flex items-center gap-3">
                    {activeRisks.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{activeRisks.length} {activeRisks.length === 1 ? 'risk' : 'risks'}</span>
                      </span>
                    )}
                    {targetDate && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Due {targetDate}
                      </span>
                    )}
                    <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Target Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(p => {
                const team = teams.find(t => t.id === p.teamId);
                const lead = users.find(u => u.id === p.leadId);
                const targetDate = p.dueDate || p.deadline;

                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">{p.key}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{team?.name || '-'}</td>
                    <td className="px-4 py-3">
                      {lead ? (
                        <div className="flex items-center gap-1.5">
                          <img src={lead.avatar} alt={lead.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-slate-800 truncate max-w-[100px]">{lead.name}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <ProjectStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={p.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-700">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      ${p.spent?.toLocaleString()} / ${p.budget?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{targetDate || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-600 font-semibold hover:text-blue-800">
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
