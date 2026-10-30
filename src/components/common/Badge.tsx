import React from 'react';
import { PriorityLevel, TaskStatus, RiskSeverity, UserRole, TeamMemberRole, ProjectStatus, ProjectRole } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export const PriorityBadge: React.FC<{ priority: PriorityLevel; className?: string }> = ({ priority, className = '' }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}>
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          Low
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus; isBlocked?: boolean; className?: string }> = ({
  status,
  isBlocked = false,
  className = ''
}) => {
  if (isBlocked) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
        Blocked
      </span>
    );
  }

  switch (status) {
    case 'DONE':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Done
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          In Progress
        </span>
      );
    case 'TODO':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          To Do
        </span>
      );
  }
};

export const RiskSeverityBadge: React.FC<{ severity: RiskSeverity | string; className?: string }> = ({ severity, className = '' }) => {
  const norm = String(severity).toUpperCase();
  switch (norm) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white shadow-xs ${className}`}>
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}>
          High
        </span>
      );
    case 'MEDIUM':
    case 'MODERATE':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          Low
        </span>
      );
  }
};

export const RoleBadge: React.FC<{ role: UserRole | string; className?: string }> = ({ role, className = '' }) => {
  const norm = String(role);
  if (norm === 'Administrator' || norm === 'ADMIN') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
        Administrator
      </span>
    );
  }
  if (norm === 'Project Manager' || norm === 'PM') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        Project Manager
      </span>
    );
  }
  if (norm === 'Team Member' || norm === 'ENGINEER') {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
        Team Member
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
      Viewer
    </span>
  );
};

export const TeamMemberRoleBadge: React.FC<{ role: TeamMemberRole | string; className?: string }> = ({ role, className = '' }) => {
  if (role === 'Admin-Assigned') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Admin-Assigned
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Member
    </span>
  );
};

export const ProjectRoleBadge: React.FC<{ role: ProjectRole | string; className?: string }> = ({ role, className = '' }) => {
  if (role === 'Manager') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
        Manager
      </span>
    );
  }
  if (role === 'Contributor') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Contributor
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Viewer
    </span>
  );
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus | string; className?: string }> = ({ status, className = '' }) => {
  const norm = String(status).toUpperCase();
  if (norm === 'ACTIVE') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Active
      </span>
    );
  }
  if (norm === 'ONHOLD' || norm === 'ON_HOLD') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        On Hold
      </span>
    );
  }
  if (norm === 'COMPLETED') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Completed
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Archived
    </span>
  );
};


