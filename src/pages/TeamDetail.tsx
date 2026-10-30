import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import {
  Users,
  FolderKanban,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Edit2,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  RoleBadge,
  TeamMemberRoleBadge,
  ProjectStatusBadge,
  PriorityBadge
} from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TeamMemberRole } from '../types';

export const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const {
    teams,
    users,
    projects,
    teamMembers: allTeamMembers,
    addMemberToTeam,
    removeMemberFromTeam,
    updateTeamMemberRole
  } = useApp();
  const { can } = useMockAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'projects'>('members');

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState<TeamMemberRole>('Member');

  const [roleChangeMember, setRoleChangeMember] = useState<{
    userId: string;
    userName: string;
    currentRole: TeamMemberRole;
  } | null>(null);
  const [newTeamRole, setNewTeamRole] = useState<TeamMemberRole>('Member');

  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return (
      <EmptyState
        title="Team Not Found"
        description="The team you are looking for does not exist or has been removed."
        actionText="Back to Teams"
        onAction={() => navigate('/teams')}
      />
    );
  }

  const lead = users.find(u => u.id === team.leadId);

  // Extract team members for this team from junction table
  const teamMemberRecords = allTeamMembers.filter(m => m.teamId === team.id);

  // Merge with users list: if team.memberIds has user not in teamMemberRecords, fall back safely
  const memberUserIds = Array.from(
    new Set([...(team.memberIds || []), ...teamMemberRecords.map(m => m.userId)])
  );

  const populatedMembers = memberUserIds
    .map(uid => {
      const user = users.find(u => u.id === uid);
      const record = teamMemberRecords.find(m => m.userId === uid);
      return {
        user,
        userId: uid,
        role: record?.role || (team.leadId === uid ? 'Admin-Assigned' : 'Member'),
        assignedAt: record?.assignedAt || team.createdAt
      };
    })
    .filter(m => m.user !== undefined);

  const availableUsers = users.filter(u => !memberUserIds.includes(u.id));
  const teamProjects = projects.filter(p => p.teamId === team.id);

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    addMemberToTeam(team.id, selectedUserId, selectedUserRole);
    setSelectedUserId('');
    setSelectedUserRole('Member');
    setIsAddMemberOpen(false);
  };

  const handleRoleChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleChangeMember) return;
    updateTeamMemberRole(team.id, roleChangeMember.userId, newTeamRole);
    setRoleChangeMember(null);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    removeMemberFromTeam(team.id, memberToRemove.userId);
    setMemberToRemove(null);
  };

  return (
    <div className="space-y-6">
      {/* Header (S-07) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={() => navigate('/teams')}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors mt-0.5"
              title="Back to Teams"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{team.name}</h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  Team Detail (S-07)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {team.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {lead && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <img
                src={lead.avatarUrl || lead.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={lead.fullName || lead.name}
                className="w-9 h-9 rounded-full object-cover border border-white shadow-2xs"
              />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Team Lead</span>
                <span className="font-semibold text-slate-800">{lead.fullName || lead.name}</span>
                <span className="text-slate-400 block text-[10px]">{lead.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between bg-white px-4 rounded-t-xl border-t border-x">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({populatedMembers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects ({teamProjects.length})</span>
          </button>
        </div>

        {activeTab === 'members' && can('manage_team_members') && (
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'members' ? (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Global Role</th>
                <th className="px-4 py-3">Team Role (SRS §6.2)</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Assigned</th>
                {can('manage_team_members') && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {populatedMembers.map(({ user, userId, role, assignedAt }) => {
                if (!user) return null;
                const isLead = team.leadId === userId;
                const capacity = user.configuredCapacityHours ?? user.capacityHours ?? 40;

                return (
                  <tr key={userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={user.fullName || user.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900">{user.fullName || user.name}</p>
                            {isLead && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                Lead
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.globalRole || user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <TeamMemberRoleBadge role={role} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.department || 'Engineering'}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 tabular-nums">
                      {capacity}h/week
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {assignedAt ? new Date(assignedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    {can('manage_team_members') && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setRoleChangeMember({
                                userId,
                                userName: user.fullName || user.name,
                                currentRole: role
                              });
                              setNewTeamRole(role);
                            }}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                            title="Change Team Role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isLead && (
                            <button
                              onClick={() => {
                                setMemberToRemove({
                                  userId,
                                  userName: user.fullName || user.name
                                });
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Remove member from team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {teamProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-2xs">
              <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Projects Assigned</p>
              <p className="text-xs text-slate-400 mt-1">
                This team does not currently have any active or scheduled projects.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer shadow-2xs transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {p.key || p.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={p.priority} />
                        <ProjectStatusBadge status={p.status} />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-700 font-mono">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${p.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'None'}
                      </span>
                      <span className="font-mono text-slate-500">
                        {p.openTasksCount ?? 0} open tasks
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Add Member to {team.name}</h3>
                <p className="text-[10px] text-slate-400">Select user and assign team role</p>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Teammate</label>
                {availableUsers.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    All workspace users are already members of this team.
                  </p>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">-- Choose User --</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.name} ({u.globalRole || u.role} - {u.department || 'Engineering'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Member Role (SRS §6.2)</label>
                <select
                  value={selectedUserRole}
                  onChange={e => setSelectedUserRole(e.target.value as TeamMemberRole)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Member">Member</option>
                  <option value="Admin-Assigned">Admin-Assigned</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  "Admin-Assigned" denotes team administrative assignment.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserId}
                  className="px-4 py-1.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {roleChangeMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Change Team Role</h3>
                <p className="text-[10px] text-slate-500">Updating role for {roleChangeMember.userName}</p>
              </div>
              <button
                onClick={() => setRoleChangeMember(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Select New Role</label>
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="teamRole"
                    value="Member"
                    checked={newTeamRole === 'Member'}
                    onChange={() => setNewTeamRole('Member')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Member</span>
                    <span className="text-[11px] text-slate-500">Standard team contributor with task participation</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="teamRole"
                    value="Admin-Assigned"
                    checked={newTeamRole === 'Admin-Assigned'}
                    onChange={() => setNewTeamRole('Admin-Assigned')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Admin-Assigned</span>
                    <span className="text-[11px] text-slate-500">Designated team-level administrator</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoleChangeMember(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-rose-600">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Remove Team Member</h3>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{memberToRemove.userName}</strong> from <strong className="text-slate-900">{team.name}</strong>? They will lose access to team-specific projects.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-1.5 rounded-lg font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
