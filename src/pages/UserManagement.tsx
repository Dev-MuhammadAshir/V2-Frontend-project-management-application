import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import { RoleBadge } from '../components/common/Badge';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  X,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { GlobalRole, User } from '../types';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, addToast } = useApp();
  const { currentUser, can } = useMockAuth();

  // RBAC Enforcement: Redirect non-Administrators to 403 Forbidden
  if (!can('view_user_management')) {
    return <Navigate to="/403" replace />;
  }

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<User | null>(null);

  // Form states for S-04: Provision User
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [globalRole, setGlobalRole] = useState<GlobalRole>('Team Member');
  const [department, setDepartment] = useState('Core Engineering');
  const [configuredCapacityHours, setConfiguredCapacityHours] = useState(40);

  // Form state for S-05: Role Assignment
  const [targetRole, setTargetRole] = useState<GlobalRole>('Team Member');

  // Form state for S-02: Password Reset
  const [tempPassword, setTempPassword] = useState('PassKey_2026!');
  const [sendResetEmail, setSendResetEmail] = useState(true);

  const filteredUsers = users.filter(u => {
    const userRole = u.globalRole || u.role;
    if (roleFilter !== 'ALL' && userRole !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const userName = (u.fullName || u.name || '').toLowerCase();
      const userEmail = (u.email || '').toLowerCase();
      const userDept = (u.department || '').toLowerCase();
      return userName.includes(q) || userEmail.includes(q) || userDept.includes(q);
    }
    return true;
  });

  // Handle S-04 Provision User submit
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const newUser: Omit<User, 'id' | 'assignedHours'> = {
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?auto=format&fit=crop&w=150&q=80`,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?auto=format&fit=crop&w=150&q=80`,
      globalRole,
      role: globalRole,
      status: 'ACTIVE',
      isActive: true,
      configuredCapacityHours: Number(configuredCapacityHours),
      capacityHours: Number(configuredCapacityHours),
      department: department.trim(),
      skills: ['TypeScript', 'Cloud Systems'],
      workSchedule: 'Mon-Fri 09:00 - 17:00 EST',
      createdAt: new Date().toISOString()
    };

    addUser(newUser);

    addToast({
      type: 'success',
      title: 'User Provisioned (S-04)',
      message: `Account created for ${fullName} with ${globalRole} permissions.`
    });

    setFullName('');
    setEmail('');
    setIsCreateOpen(false);
  };

  // Handle S-05 Role Assignment submit
  const handleRoleAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    updateUser(selectedUserForRole.id, {
      globalRole: targetRole,
      role: targetRole
    });

    addToast({
      type: 'success',
      title: 'Global Role Updated (S-05)',
      message: `${selectedUserForRole.fullName || selectedUserForRole.name} is now a ${targetRole}.`
    });

    setSelectedUserForRole(null);
  };

  // Handle S-02 Password Reset submit
  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPasswordReset) return;

    addToast({
      type: 'success',
      title: 'Password Reset Initiated (S-02)',
      message: `Temporary password generated for ${selectedUserForPasswordReset.fullName || selectedUserForPasswordReset.name}.`
    });

    setSelectedUserForPasswordReset(null);
  };

  // Permission preview descriptors for S-05 modal
  const rolePermissionsSummary: Record<GlobalRole, { summary: string; access: string[] }> = {
    'Administrator': {
      summary: 'Complete platform governance and system administration.',
      access: [
        'User account creation, deactivation & password resets (S-04, S-02)',
        'Global role modifications (S-05)',
        'Team creation & organization management (S-06, S-07)',
        'System audit trail inspection (S-26)',
        'Full project & task modification across the workspace'
      ]
    },
    'Project Manager': {
      summary: 'Project lifecycle orchestration, risk management & team allocation.',
      access: [
        'Project creation, milestone updates & member rosters (S-08, S-09)',
        'Task creation, editing & Kanban prioritization (S-12, S-13)',
        'PIRAE predictive risk review & resolution (S-27, S-28)',
        'Project analytics & audit logs access (S-21, S-26)',
        'Cannot provision system users or assign administrator roles'
      ]
    },
    'Team Member': {
      summary: 'Sprint task delivery, time logging & collaboration.',
      access: [
        'Active task execution & Kanban drag-drop (S-12)',
        'Discussion comments & 15-minute edit countdown (S-18)',
        'Attachment uploads & subtask completion (S-23)',
        'View PIRAE project risks advisory insights (S-27)',
        'Cannot modify project settings or access audit logs'
      ]
    },
    'Viewer': {
      summary: 'Read-only stakeholder visibility into project progress.',
      access: [
        'View authorized project dashboards & task lists (S-09, S-14)',
        'View team directory and member rosters (S-06, S-07)',
        'Read-only Kanban board view without drag-drop rights',
        'Cannot create, edit, or delete tasks or comments'
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner (S-04) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              User Management & Access Governance (S-04)
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 font-mono">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            System account provisioning, global role assignments (S-05), and capacity limit controls
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="Administrator">Administrator</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Team Member">Team Member</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* User Table (S-04) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Global Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Capacity (10-80h)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const userRole = u.globalRole || (u.role as GlobalRole);
                const isActive = u.isActive !== undefined ? u.isActive : u.status === 'ACTIVE';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Avatar, Name, Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || u.avatar}
                          alt={u.fullName || u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {u.fullName || u.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Global Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RoleBadge role={userRole} />
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {u.department || 'Engineering'}
                    </td>

                    {/* Configured Capacity Hours */}
                    <td className="px-4 py-3 font-mono whitespace-nowrap">
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {u.configuredCapacityHours || u.capacityHours || 40}h
                      </span>
                      <span className="text-slate-400 text-[10px]"> / wk</span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        ></span>
                        {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Admin Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* S-05 Role Assignment trigger */}
                        <button
                          onClick={() => {
                            setSelectedUserForRole(u);
                            setTargetRole(userRole);
                          }}
                          title="Assign Global Role (S-05)"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* S-02 Password Reset trigger */}
                        <button
                          onClick={() => setSelectedUserForPasswordReset(u)}
                          title="Reset Password (S-02)"
                          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            isActive
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* S-04: Provision New User Modal */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provision User Account (S-04)</h3>
                  <p className="text-[11px] text-slate-500">Admin-only registration per SRS §4.1</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya.lin@projectflow.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Global Role</label>
                  <select
                    value={globalRole}
                    onChange={e => setGlobalRole(e.target.value as GlobalRole)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Team Member">Team Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weekly Capacity (10-80h)</label>
                  <input
                    type="number"
                    min={10}
                    max={80}
                    value={configuredCapacityHours}
                    onChange={e => setConfiguredCapacityHours(Number(e.target.value))}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* S-05: Role Assignment Modal with Permission Preview */}
      {/* ========================================================================= */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Global Role Assignment (S-05)</h3>
                  <p className="text-[11px] text-slate-500">
                    Modify permissions for {selectedUserForRole.fullName || selectedUserForRole.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleAssignment} className="space-y-4 text-xs">
              {/* Target User Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                <img
                  src={selectedUserForRole.avatarUrl || selectedUserForRole.avatar}
                  alt={selectedUserForRole.fullName || selectedUserForRole.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {selectedUserForRole.fullName || selectedUserForRole.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedUserForRole.email}</p>
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Target Global Role
                </label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value as GlobalRole)}
                  className="w-full text-xs font-semibold border border-indigo-200 bg-indigo-50/50 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-900"
                >
                  <option value="Administrator">Administrator (Superuser Governance)</option>
                  <option value="Project Manager">Project Manager (Elevated Management)</option>
                  <option value="Team Member">Team Member (Standard Read/Write)</option>
                  <option value="Viewer">Viewer (Read-Only Stakeholder)</option>
                </select>
              </div>

              {/* Live Permission Preview Box (Mandatory S-05 requirement) */}
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Permission Capabilities Preview</span>
                </div>
                <p className="text-[11px] text-indigo-950/80">
                  {rolePermissionsSummary[targetRole].summary}
                </p>
                <ul className="space-y-1 pt-1 text-[11px] text-slate-600">
                  {rolePermissionsSummary[targetRole].access.map((acc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRole(null)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-xs transition-colors"
                >
                  Confirm Role Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* S-02: Password Reset Modal (Admin Initiated) */}
      {/* ========================================================================= */}
      {selectedUserForPasswordReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Admin Password Reset (S-02)</h3>
                  <p className="text-[11px] text-slate-500">
                    Generate temporary credentials for user recovery
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForPasswordReset(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <p className="font-semibold text-slate-800">
                  {selectedUserForPasswordReset.fullName || selectedUserForPasswordReset.name}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">{selectedUserForPasswordReset.email}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Generated Temporary Password
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  User will be prompted to replace temporary credentials upon next login.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendResetEmail}
                  onChange={e => setSendResetEmail(e.target.checked)}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <span className="text-slate-700">Send simulated reset notification email</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPasswordReset(null)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer shadow-xs transition-colors"
                >
                  Confirm Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
