import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useMockAuth } from '../../context/MockAuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Kanban,
  CheckCircle2,
  Users,
  UserCheck,
  BarChart3,
  ShieldAlert,
  FileText,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const { tasks, risks } = useApp();
  const { currentUser, can } = useMockAuth();

  const currentUserId = currentUser?.id || 'usr-1';
  const myTasksCount = tasks.filter(
    t => (t.assigneeIds?.includes(currentUserId) || t.assigneeId === currentUserId) && t.status !== 'DONE'
  ).length;

  const criticalRisksCount = risks.filter(
    r => (r.status === 'Open' || r.status === 'OPEN') &&
         (r.severity === 'Critical' || r.severity === 'High' || r.severity === 'CRITICAL' || r.severity === 'HIGH')
  ).length;

  // Navigation Items with RBAC permissions
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: null },
    { label: 'Projects', path: '/projects', icon: FolderKanban, permission: 'view_project' },
    { label: 'Kanban Board', path: '/kanban', icon: Kanban, permission: null },
    { label: 'Task List', path: '/tasks', icon: CheckSquare, permission: 'view_task' },
    {
      label: 'My Tasks',
      path: '/my-tasks',
      icon: CheckCircle2,
      permission: null,
      badge: myTasksCount > 0 ? myTasksCount : undefined,
      badgeColor: 'bg-blue-600 text-white'
    },
    { label: 'Teams', path: '/teams', icon: Users, permission: null },
    {
      label: 'User Management',
      path: '/users',
      icon: UserCheck,
      permission: 'view_user_management' // Admin only
    },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, permission: 'view_analytics' },
    {
      label: 'PIRAE Risks',
      path: '/risks',
      icon: ShieldAlert,
      permission: 'view_pirae_risks', // Admin, PM, Team Member (Hidden for Viewer)
      badge: criticalRisksCount > 0 ? criticalRisksCount : undefined,
      badgeColor: 'bg-rose-600 text-white'
    },
    {
      label: 'Audit Logs',
      path: '/audit-logs',
      icon: FileText,
      permission: 'view_audit_logs' // Admin & PM only
    },
    { label: 'Settings', path: '/settings', icon: Settings, permission: null }
  ];

  // Filter items by RBAC can(...)
  const visibleNavItems = navItems.filter(item => !item.permission || can(item.permission));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Shell: 240px (w-60) or 64px (w-16) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:w-16' : 'md:w-60'
        } w-60 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-blue-500/20">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-150">
                <span className="text-sm font-bold text-white tracking-tight block truncate">
                  ProjectFlow
                </span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">
                  SRS v3.0 Prototype
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar (240px)' : 'Collapse sidebar (64px)'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Navigation
            </div>
          )}

          {visibleNavItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-xs font-medium transition-all group ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {/* Dot badge when collapsed */}
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0F172A]" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer: User profile widget */}
        {currentUser && (
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 px-2 py-1'}`}>
              <img
                src={currentUser.avatarUrl || currentUser.avatar}
                alt={currentUser.fullName || currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser.fullName || currentUser.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-blue-400 font-medium truncate">
                      {currentUser.globalRole}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
