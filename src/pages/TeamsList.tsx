import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, FolderKanban, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { CardGridSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';

export const TeamsList: React.FC = () => {
  const { teams, users, projects, addTeam, isSimulatedLoading } = useApp();
  const { currentUser, can } = useMockAuth();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState(currentUser?.id || 'usr-1');

  if (isSimulatedLoading) {
    return <CardGridSkeleton count={4} />;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTeam({
      name: name.trim(),
      description: description.trim() || null,
      leadId,
      memberIds: [leadId],
      createdAt: new Date().toISOString()
    });
    setName('');
    setDescription('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Teams & Departments (S-06)
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {teams.length} Teams
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-functional pods, platform groups, and project assignments
          </p>
        </div>

        {can('create_team') ? (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Team</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Admin Only</span>
          </div>
        )}
      </div>

      {/* Team Cards Grid */}
      {teams.length === 0 ? (
        <EmptyState
          title="No Teams Found"
          description="Create your first team to start assigning projects and members."
          actionText={can('create_team') ? "Create Team" : undefined}
          onAction={can('create_team') ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map(team => {
            const lead = users.find(u => u.id === team.leadId);
            const teamProjects = projects.filter(p => p.teamId === team.id);
            const memberCount = team.memberIds?.length || 0;

            return (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Users className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {team.name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Lead info */}
                  <div className="flex items-center gap-2">
                    {lead ? (
                      <>
                        <img
                          src={lead.avatarUrl || lead.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={lead.fullName || lead.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-slate-600 text-[11px]">
                          Lead: <span className="font-semibold text-slate-800">{lead.fullName || lead.name}</span>
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">No lead assigned</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <FolderKanban className="w-3 h-3 text-slate-400" />
                      {teamProjects.length} {teamProjects.length === 1 ? 'project' : 'projects'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal (Admin Only) */}
      {isCreateOpen && can('create_team') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create New Team</h3>
                <p className="text-[11px] text-slate-500">Form a new organizational unit or feature squad</p>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Infrastructure Pod"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Scope of work, mission, and responsibilities..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Lead</label>
                <select
                  value={leadId}
                  onChange={e => setLeadId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-blue-500"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.name} ({u.globalRole || u.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Team lead will automatically be assigned with "Admin-Assigned" membership role.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
