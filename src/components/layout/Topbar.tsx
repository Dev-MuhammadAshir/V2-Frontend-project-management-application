import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Check,
  ExternalLink,
  Shield,
  User as UserIcon,
  LogOut,
  Sliders,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useMockAuth } from '../../context/MockAuthContext';
import { GlobalRole } from '../../types';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  onOpenCreateTask: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, onOpenCreateTask }) => {
  const {
    currentUser,
    users,
    setCurrentUserById,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCommandPaletteOpen,
    isSimulatedLoading,
    toggleSimulatedLoading,
    simulatedError,
    setSimulatedError,
    openTaskDrawer
  } = useApp();
  const { switchRole } = useMockAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const stateMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (stateMenuRef.current && !stateMenuRef.current.contains(e.target as Node)) {
        setIsStateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumb title based on path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/projects/')) return 'Projects / Project Details';
    if (path === '/projects') return 'Projects';
    if (path === '/kanban') return 'Kanban Board';
    if (path === '/tasks') return 'Task Management';
    if (path === '/my-tasks') return 'My Work / Active Tasks';
    if (path.startsWith('/teams/')) return 'Teams / Team Workspace';
    if (path === '/teams') return 'Team Directories';
    if (path === '/users') return 'User Directory & Access';
    if (path === '/analytics') return 'Analytics & Velocity Dashboard';
    if (path === '/risks') return 'PIRAE Risk Intelligence';
    if (path === '/audit-logs') return 'System Audit Trail';
    if (path === '/settings') return 'Workspace & PIRAE Settings';
    if (path === '/profile') return 'My Profile & Capacity';
    if (path === '/notifications') return 'Notification Center';
    return 'ProjectFlow Workspace';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger + Logo + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-slate-400 hidden lg:inline">Workspace</span>
          <span className="text-xs text-slate-300 hidden lg:inline">/</span>
          <h1 className="text-sm font-semibold text-slate-900 truncate">{getBreadcrumb()}</h1>
        </div>
      </div>

      {/* Center: Global Search Bar Trigger (Ctrl+K) */}
      <div className="hidden sm:flex flex-1 max-w-md mx-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
            <span className="truncate">Search tasks, projects, teams...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Fake Connection Status Dot (Always Green per Target Spec) */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium"
          title="Real-Time Engine: Connected & Synchronized (18ms latency)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px]">Connected</span>
        </div>

        {/* Dev-Only RBAC Role Switcher (Target Requirement for Prototype Demo) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-900 shadow-2xs">
          <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-wider text-indigo-500 font-mono">
            RBAC:
          </span>
          <select
            value={currentUser.globalRole || 'Administrator'}
            onChange={(e) => {
              const newRole = e.target.value as GlobalRole;
              switchRole(newRole);
              const mappedUser = users.find(u => u.globalRole === newRole);
              if (mappedUser) {
                setCurrentUserById(mappedUser.id);
              }
            }}
            className="text-xs font-semibold bg-transparent text-indigo-950 focus:outline-none cursor-pointer pr-1"
            title="Switch active role to test RBAC permissions"
          >
            <option value="Administrator">Administrator</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Team Member">Team Member</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        {/* Quick Create Task */}
        <button
          onClick={onOpenCreateTask}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* State Simulator Dropdown (Demonstrates Skeletons / Error pages for SRS evaluation) */}
        <div className="relative" ref={stateMenuRef}>
          <button
            onClick={() => setIsStateMenuOpen(!isStateMenuOpen)}
            title="State Simulator (Loading & Error States)"
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              isSimulatedLoading || simulatedError
                ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">States</span>
          </button>

          {isStateMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                SRS State Simulator
              </div>
              <button
                onClick={() => {
                  toggleSimulatedLoading();
                  setIsStateMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>Simulate Loading Skeletons</span>
                {isSimulatedLoading && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulate HTTP Errors
              </div>
              <button
                onClick={() => {
                  setSimulatedError(simulatedError === 403 ? null : 403);
                  setIsStateMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>403 Forbidden Page</span>
                {simulatedError === 403 && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  setSimulatedError(simulatedError === 404 ? null : 404);
                  setIsStateMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>404 Not Found Page</span>
                {simulatedError === 404 && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  setSimulatedError(simulatedError === 500 ? null : 500);
                  setIsStateMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>500 Internal Error Page</span>
                {simulatedError === 500 && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
              {(isSimulatedLoading || simulatedError) && (
                <div className="pt-1 mt-1 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      if (isSimulatedLoading) toggleSimulatedLoading();
                      setSimulatedError(null);
                      setIsStateMenuOpen(false);
                    }}
                    className="w-full text-center py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Reset to Normal State
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown (S-19) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.slice(0, 6).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        setIsNotifOpen(false);
                        if (n.link.includes('task=')) {
                          const taskId = n.link.split('task=')[1];
                          openTaskDrawer(taskId);
                        } else {
                          navigate(n.link);
                        }
                      }}
                      className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {!n.read ? (
                          <span className="w-2 h-2 rounded-full bg-blue-600 block shrink-0"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-200 block shrink-0"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full cursor-pointer"
                >
                  <span>Open Full Notification Center (S-20)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition-all cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                    Role: {currentUser.role}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentUser.capacityHours}h capacity
                  </span>
                </div>
              </div>

              {/* Quick Switch Role (SRS Testing Helper) */}
              <div className="px-3 py-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (Demo)
                </span>
                <div className="mt-1 space-y-0.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserById(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs text-left cursor-pointer transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Capacity (S-03)</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Settings (S-29)</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
