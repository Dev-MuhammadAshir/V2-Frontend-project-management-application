import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import {
  PriorityBadge,
  StatusBadge,
  RiskSeverityBadge,
  RoleBadge,
  ProjectRoleBadge,
  ProjectStatusBadge
} from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import {
  FolderKanban,
  Kanban,
  CheckSquare,
  Users,
  ShieldAlert,
  BarChart2,
  FileText,
  Calendar,
  DollarSign,
  ArrowLeft,
  Plus,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  ShieldCheck,
  ChevronRight,
  Clock,
  X,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ProjectRole, TaskStatus, TaskPriority } from '../types';

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    teams,
    users,
    risks,
    auditLogs,
    projectMembers,
    openTaskDrawer,
    openRiskModal,
    moveTaskStatus,
    deleteProject,
    addMemberToProject,
    removeMemberFromProject,
    updateProjectMemberRole,
    resolveRisk
  } = useApp();
  const { can, currentUser } = useMockAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'list' | 'members' | 'risks' | 'analytics' | 'audit'>('overview');

  // Modals state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('');
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<ProjectRole>('Contributor');

  // Role change modal
  const [memberRoleModal, setMemberRoleModal] = useState<{ userId: string; currentRole: ProjectRole } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isDeleteProjectConfirm, setIsDeleteProjectConfirm] = useState(false);

  // Task list filters
  const [listStatusFilter, setListStatusFilter] = useState<string>('ALL');
  const [listPriorityFilter, setListPriorityFilter] = useState<string>('ALL');

  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="The project you are looking for does not exist or has been removed."
        actionText="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const team = teams.find(t => t.id === project.teamId);
  const lead = users.find(u => u.id === project.leadId);
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectRisks = risks.filter(r => r.projectId === project.id);
  const projectAudit = auditLogs.filter(
    a => (a.entityType === 'PROJECT' && a.entityId === project.id) || projectTasks.some(t => t.id === a.entityId)
  );

  const completedTasks = projectTasks.filter(t => t.status === 'DONE');
  const inProgressTasks = projectTasks.filter(t => t.status === 'IN_PROGRESS');
  const todoTasks = projectTasks.filter(t => t.status === 'TODO');
  const now = new Date().toISOString().split('T')[0];
  const overdueTasks = projectTasks.filter(t => t.dueDate < now && t.status !== 'DONE');

  // Compute days remaining until deadline
  const targetDate = project.dueDate || project.deadline;
  let daysRemainingText = 'No deadline';
  if (targetDate) {
    const diffTime = new Date(targetDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      daysRemainingText = `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      daysRemainingText = 'Due today';
    } else {
      daysRemainingText = `${diffDays} days remaining`;
    }
  }

  // Workload per team member data for S-22 Analytics
  const memberWorkloadData = users
    .filter(u => projectTasks.some(t => t.assigneeId === u.id))
    .map(u => {
      const assignedToUser = projectTasks
        .filter(t => t.assigneeId === u.id)
        .reduce((acc, curr) => acc + curr.estimatedHours, 0);
      return {
        name: u.name.split(' ')[0],
        assigned: assignedToUser,
        capacity: u.configuredCapacityHours || u.capacityHours || 40
      };
    });

  // Project Members Table (S-11)
  // Consolidate members from projectMembers junction and project.memberIds
  const currentAssignedMemberIds = Array.from(
    new Set([
      ...(project.memberIds || []),
      ...projectMembers.filter(m => m.projectId === project.id).map(m => m.userId)
    ])
  );

  const projectMembersList = currentAssignedMemberIds
    .map(userId => {
      const user = users.find(u => u.id === userId);
      const junction = projectMembers.find(m => m.projectId === project.id && m.userId === userId);
      let role: ProjectRole = junction?.role || (userId === project.leadId ? 'Manager' : 'Contributor');
      const userActiveTasks = projectTasks.filter(t => t.assigneeId === userId && t.status !== 'DONE').length;
      return {
        user,
        userId,
        role,
        userActiveTasks
      };
    })
    .filter(item => item.user !== undefined);

  // Available users to add to this project
  const availableUsersToAdd = users.filter(u => !currentAssignedMemberIds.includes(u.id));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'board', label: 'Board (S-12)', icon: Kanban, count: projectTasks.length },
    { id: 'list', label: 'Task List (S-14)', icon: CheckSquare },
    { id: 'members', label: 'Project Members (S-11)', icon: Users, count: projectMembersList.length },
    { id: 'risks', label: 'PIRAE Risks', icon: ShieldAlert, count: projectRisks.length, highlight: projectRisks.some(r => r.status !== 'Resolved' && r.status !== 'MITIGATED' && r.status !== 'DISMISSED') },
    { id: 'analytics', label: 'Analytics (S-22)', icon: BarChart2 },
    { id: 'audit', label: 'Audit Trail', icon: FileText }
  ];

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdToAdd) return;
    addMemberToProject(project.id, selectedUserIdToAdd, selectedRoleToAdd);
    setIsAddMemberOpen(false);
    setSelectedUserIdToAdd('');
  };

  const handleConfirmRoleChange = () => {
    if (!memberRoleModal) return;
    updateProjectMemberRole(project.id, memberRoleModal.userId, memberRoleModal.currentRole);
    setMemberRoleModal(null);
  };

  const handleConfirmRemoveMember = () => {
    if (!memberToRemove) return;
    removeMemberFromProject(project.id, memberToRemove);
    setMemberToRemove(null);
  };

  const handleConfirmDeleteProject = () => {
    deleteProject(project.id);
    navigate('/projects');
  };

  const filteredTasksForList = projectTasks.filter(t => {
    if (listStatusFilter !== 'ALL' && t.status !== listStatusFilter) return false;
    if (listPriorityFilter !== 'ALL' && t.priority !== listPriorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer transition-colors"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {project.key}
                </span>
                <ProjectStatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
                {team && (
                  <button
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded"
                  >
                    <span>{team.name}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{project.title}</h1>
            </div>
          </div>

          {/* Header Action Buttons (RBAC: Admin & PM) */}
          <div className="flex items-center gap-2">
            {lead && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <img src={lead.avatar} alt={lead.name} className="w-5 h-5 rounded-full object-cover" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block leading-none">Lead</span>
                  <span className="text-xs font-semibold text-slate-800 leading-none">{lead.name}</span>
                </div>
              </div>
            )}

            {can('edit_project') && (
              <button
                onClick={() => setIsEditProjectOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Edit Project Details"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            )}

            {can('delete_project') && (
              <button
                onClick={() => setIsDeleteProjectConfirm(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                title="Archive / Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Description & KPI strip */}
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          {project.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Target Due Date</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{targetDate || 'None'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {daysRemainingText}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Budget & Spend</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-semibold text-slate-800">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>${project.spent?.toLocaleString()} / ${project.budget?.toLocaleString()}</span>
            </div>
            <div className="w-28 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round(((project.spent || 0) / (project.budget || 1)) * 100))}%` }}
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Delivery Progress</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-blue-600">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>{project.progress}% completed</span>
            </div>
            <div className="w-28 bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Tasks Ratio</span>
            <div className="flex items-center gap-1.5 mt-1 font-mono font-semibold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{completedTasks.length} done / {projectTasks.length} total</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              {inProgressTasks.length} in progress · {todoTasks.length} backlog
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (S-09) */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      tab.highlight
                        ? 'bg-rose-100 text-rose-700 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Create Task action shortcut for Board/List tabs */}
        {(activeTab === 'board' || activeTab === 'list') && can('create_task') && (
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Tab Content Panels */}
      <div>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Sprint Milestone State */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Sprint Milestone State
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Tasks Completed</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {completedTasks.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">In Progress</span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {inProgressTasks.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Backlog (To Do)</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {todoTasks.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Overdue Deliverables</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      overdueTasks.length > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-400 bg-slate-50'
                    }`}>
                      {overdueTasks.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Associated Team Summary */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Associated Team
                  </h3>
                  {team && (
                    <button
                      onClick={() => navigate(`/teams/${team.id}`)}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View Team →
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{team?.name || 'Assigned Pod'}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{team?.description || 'No description'}</p>
                    <p className="text-[11px] font-mono text-slate-600 mt-1">
                      {projectMembersList.length} project {projectMembersList.length === 1 ? 'member' : 'members'} assigned
                    </p>
                  </div>
                </div>
              </div>

              {/* PIRAE Risk Snapshot */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    PIRAE Risk Snapshot
                  </h3>
                  <button
                    onClick={() => setActiveTab('risks')}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>
                {projectRisks.length === 0 ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-xs text-emerald-700 font-medium">
                      Zero high-severity risks identified by PIRAE engine.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {projectRisks.slice(0, 3).map(r => (
                      <div
                        key={r.id}
                        onClick={() => openRiskModal(r.id)}
                        className="p-2 rounded-lg bg-rose-50/70 border border-rose-200 text-xs cursor-pointer hover:bg-rose-100 transition-colors flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-rose-900 truncate block">{r.title}</span>
                          <span className="text-[10px] text-rose-600 font-mono">{r.type}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-700 shrink-0">{r.score}/100</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Deliverables Preview */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Tasks Snapshot
                </h3>
                <button
                  onClick={() => setActiveTab('board')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Open Board →
                </button>
              </div>

              {projectTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No tasks added yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projectTasks.slice(0, 5).map(t => {
                    const assignee = users.find(u => u.id === t.assigneeId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => openTaskDrawer(t.id)}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] font-bold text-slate-400">{t.key}</span>
                          <span className="text-xs font-semibold text-slate-900">{t.title}</span>
                          <StatusBadge status={t.status} isBlocked={t.isBlocked} />
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          {assignee && (
                            <span className="text-slate-600 font-medium">{assignee.name}</span>
                          )}
                          <span className="font-mono text-slate-400 text-[11px]">Due {t.dueDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Board (S-12 Kanban Board) */}
        {activeTab === 'board' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(statusCol => {
                const colTasks = projectTasks.filter(t => t.status === statusCol);
                const colTitle = statusCol === 'TODO' ? 'Backlog (To Do)' : statusCol === 'IN_PROGRESS' ? 'In Progress' : 'Completed (Done)';
                const headerColor = statusCol === 'TODO' ? 'bg-slate-500' : statusCol === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-emerald-600';

                return (
                  <div key={statusCol} className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200 min-h-[460px] flex flex-col justify-between">
                    <div>
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${headerColor}`} />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{colTitle}</span>
                        </div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Column Cards */}
                      <div className="space-y-2.5">
                        {colTasks.length === 0 ? (
                          <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                            No {colTitle.toLowerCase()}
                          </div>
                        ) : (
                          colTasks.map(t => {
                            const assignee = users.find(u => u.id === t.assigneeId);
                            const doneSubtasks = t.subtasks?.filter(s => s.done || s.completed)?.length || 0;
                            const totalSubtasks = t.subtasks?.length || 0;

                            return (
                              <div
                                key={t.id}
                                className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer group space-y-2"
                                onClick={() => openTaskDrawer(t.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-mono text-[11px] font-bold text-slate-500">{t.key}</span>
                                  <PriorityBadge priority={t.priority} />
                                </div>

                                <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {t.title}
                                </h4>

                                {t.isBlocked && (
                                  <div className="flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Blocked: {t.blockedReason || 'Dependency conflict'}</span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    {assignee ? (
                                      <img
                                        src={assignee.avatar}
                                        alt={assignee.name}
                                        title={assignee.name}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Unassigned</span>
                                    )}
                                    {totalSubtasks > 0 && (
                                      <span className="text-[10px] font-mono text-slate-500">
                                        ✓ {doneSubtasks}/{totalSubtasks}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {t.dueDate}
                                    </span>
                                  </div>
                                </div>

                                {/* Status Transitions Controls */}
                                <div
                                  className="pt-2 flex items-center justify-end gap-1 border-t border-slate-50"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {statusCol !== 'TODO' && (
                                    <button
                                      onClick={() => moveTaskStatus(t.id, 'TODO')}
                                      className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                                    >
                                      ← Backlog
                                    </button>
                                  )}
                                  {statusCol !== 'IN_PROGRESS' && (
                                    <button
                                      onClick={() => moveTaskStatus(t.id, 'IN_PROGRESS')}
                                      className="px-2 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                                    >
                                      → In Prog
                                    </button>
                                  )}
                                  {statusCol !== 'DONE' && (
                                    <button
                                      onClick={() => moveTaskStatus(t.id, 'DONE')}
                                      className="px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded cursor-pointer"
                                    >
                                      ✓ Done
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Column Footer Action */}
                    {can('create_task') && (
                      <button
                        onClick={() => setIsCreateTaskOpen(true)}
                        className="mt-3 w-full py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: List (S-14 Task List) */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-[11px] font-medium text-slate-400">Filter Status:</span>
                  <select
                    value={listStatusFilter}
                    onChange={e => setListStatusFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="text-[11px] font-medium text-slate-400">Filter Priority:</span>
                  <select
                    value={listPriorityFilter}
                    onChange={e => setListPriorityFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                {(listStatusFilter !== 'ALL' || listPriorityFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setListStatusFilter('ALL');
                      setListPriorityFilter('ALL');
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {can('create_task') && (
                <button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Subtasks</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasksForList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No tasks match criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTasksForList.map(t => {
                      const assignee = users.find(u => u.id === t.assigneeId);
                      const doneSubtasks = t.subtasks?.filter(s => s.done || s.completed)?.length || 0;
                      const totalSubtasks = t.subtasks?.length || 0;

                      return (
                        <tr
                          key={t.id}
                          onClick={() => openTaskDrawer(t.id)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-mono font-bold text-slate-500">{t.key}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-sm truncate">{t.title}</td>
                          <td className="px-4 py-3">
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full object-cover" />
                                <span className="text-slate-800">{assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={t.status} isBlocked={t.isBlocked} /></td>
                          <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {totalSubtasks > 0 ? `${doneSubtasks}/${totalSubtasks}` : '-'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">{t.dueDate}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-blue-600 font-semibold hover:text-blue-800">
                              Edit →
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Members (S-11 Project Members: Table with role) */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Project Members Roster (S-11)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage assigned project roles (Manager, Contributor, Viewer) and monitor individual task loads
                </p>
              </div>

              {can('manage_project_members') && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign Member</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Global Role</th>
                    <th className="px-4 py-3">Project Role</th>
                    <th className="px-4 py-3">Weekly Capacity</th>
                    <th className="px-4 py-3">Active Tasks</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectMembersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No members assigned yet.
                      </td>
                    </tr>
                  ) : (
                    projectMembersList.map(item => {
                      const u = item.user!;
                      const isLead = u.id === project.leadId;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isLead && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                                      Lead
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <RoleBadge role={u.globalRole || u.role} />
                          </td>

                          <td className="px-4 py-3">
                            <ProjectRoleBadge role={item.role} />
                          </td>

                          <td className="px-4 py-3 font-mono font-medium text-slate-700">
                            {u.configuredCapacityHours || u.capacityHours || 40}h / week
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {item.userActiveTasks} {item.userActiveTasks === 1 ? 'task' : 'tasks'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {can('manage_project_members') ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setMemberRoleModal({ userId: u.id, currentRole: item.role })}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  Change Role
                                </button>
                                {!isLead && (
                                  <button
                                    onClick={() => setMemberToRemove(u.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                                    title="Remove from project"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Read-only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Risks */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  PIRAE Predictive Risk Register
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated heuristics identifying schedule bottlenecks, resource overloading, and dependency stalls
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                {projectRisks.length} {projectRisks.length === 1 ? 'heuristic alert' : 'heuristic alerts'}
              </span>
            </div>

            {projectRisks.length === 0 ? (
              <EmptyState
                title="No Risks Detected"
                description="PIRAE intelligence algorithms have analyzed all tasks and dependencies: this initiative is on track."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectRisks.map(r => {
                  const isResolved = r.status === 'Resolved' || r.status === 'MITIGATED';

                  return (
                    <div
                      key={r.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <RiskSeverityBadge severity={r.severity} />
                            <span className="text-[11px] font-mono font-bold text-slate-500">{r.type || r.riskType}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-xs font-bold text-slate-700">Score:</span>
                            <span className={`text-sm font-bold ${
                              (r.score || r.riskScore || 0) >= 80 ? 'text-rose-600' : 'text-amber-600'
                            }`}>
                              {r.score || r.riskScore || 0}/100
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-2">
                          {r.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {r.reason}
                        </p>

                        {r.recommendation && (
                          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                            <span className="font-bold block text-[10px] text-blue-700 uppercase tracking-wider mb-0.5">
                              PIRAE Recommendation
                            </span>
                            {r.recommendation}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-slate-400">
                          Status: {r.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openRiskModal(r.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded cursor-pointer"
                          >
                            Details
                          </button>
                          {!isResolved && can('resolve_risk') && (
                            <button
                              onClick={() => resolveRisk(r.id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Analytics (S-22 Project Analytics) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Completion Gauge Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Completion Gauge (S-22)
                </h3>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative w-32 h-32 rounded-full border-8 border-blue-600 border-t-slate-200 flex items-center justify-center font-mono font-bold text-3xl text-slate-900">
                    {project.progress}%
                  </div>
                  <span className="text-xs text-slate-600 mt-4 font-medium">
                    Overall Project Delivery Completion
                  </span>
                  <div className="mt-3 flex items-center gap-3 text-xs font-mono text-slate-500">
                    <span>{completedTasks.length} Done</span>
                    <span>·</span>
                    <span>{inProgressTasks.length} In Progress</span>
                    <span>·</span>
                    <span>{todoTasks.length} To Do</span>
                  </div>
                </div>
              </div>

              {/* Workload per Member Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Assigned Task Hours vs Nominal Capacity
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={memberWorkloadData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="assigned" fill="#2563EB" name="Assigned Hrs" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="capacity" fill="#94A3B8" name="Capacity Hrs" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Overdue List if any */}
            {overdueTasks.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Overdue Project Deliverables ({overdueTasks.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {overdueTasks.map(ot => (
                    <div
                      key={ot.id}
                      onClick={() => openTaskDrawer(ot.id)}
                      className="text-xs flex justify-between text-rose-900 bg-white/70 p-2 rounded border border-rose-200 cursor-pointer hover:bg-white"
                    >
                      <span className="font-medium">{ot.key}: {ot.title}</span>
                      <span className="font-mono font-bold">Due: {ot.dueDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Audit */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audit Trail Events
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {projectAudit.length} {projectAudit.length === 1 ? 'event recorded' : 'events recorded'}
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Entity</th>
                  <th className="px-4 py-2.5">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectAudit.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      No audit events recorded for this initiative.
                    </td>
                  </tr>
                ) : (
                  projectAudit.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 py-2.5 font-mono text-slate-500">{new Date(a.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{a.action}</td>
                      <td className="px-4 py-2.5 text-slate-600">{a.entityName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          a.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : a.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Project Modal (S-10) */}
      <CreateProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        projectToEdit={project}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        defaultProjectId={project.id}
      />

      {/* Assign Member to Project Modal (S-11) */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Assign Member to Project</h3>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select User <span className="text-rose-500">*</span>
                </label>
                {availableUsersToAdd.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded">
                    All workspace users are already assigned to this project.
                  </p>
                ) : (
                  <select
                    value={selectedUserIdToAdd}
                    onChange={e => setSelectedUserIdToAdd(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none"
                  >
                    <option value="">-- Choose member --</option>
                    {availableUsersToAdd.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role || u.globalRole}) · {u.department || 'Engineering'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRoleToAdd}
                  onChange={e => setSelectedRoleToAdd(e.target.value as ProjectRole)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none"
                >
                  <option value="Contributor">Contributor (Standard task contributor)</option>
                  <option value="Manager">Manager (Project administration)</option>
                  <option value="Viewer">Viewer (Read-only observation)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserIdToAdd}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-xs cursor-pointer"
                >
                  Assign to Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {memberRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Update Project Role</h3>
              <button
                onClick={() => setMemberRoleModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Adjust project permissions for{' '}
                <span className="font-semibold text-slate-900">
                  {users.find(u => u.id === memberRoleModal.userId)?.name}
                </span>:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Project Role</label>
                <select
                  value={memberRoleModal.currentRole}
                  onChange={e => setMemberRoleModal({ ...memberRoleModal, currentRole: e.target.value as ProjectRole })}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none"
                >
                  <option value="Manager">Manager</option>
                  <option value="Contributor">Contributor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMemberRoleModal(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs cursor-pointer"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Remove Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to remove{' '}
                  <span className="font-semibold text-slate-800">
                    {users.find(u => u.id === memberToRemove)?.name}
                  </span>{' '}
                  from this project?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveMember}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Archive Project Confirmation Modal */}
      {isDeleteProjectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Archive / Delete Project</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to remove <span className="font-semibold text-slate-800">{project.title}</span>?
                  This action will archive the project and its references.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteProjectConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs cursor-pointer"
              >
                Archive Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
