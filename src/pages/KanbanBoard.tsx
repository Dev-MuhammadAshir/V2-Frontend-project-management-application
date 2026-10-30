import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { PriorityBadge } from '../components/common/Badge';
import {
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Search,
  ListTodo
} from 'lucide-react';
import { CardGridSkeleton } from '../components/common/SkeletonLoader';

export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    projects,
    users,
    openTaskDrawer,
    moveTaskStatus,
    liveFlashKey,
    isSimulatedLoading
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  if (isSimulatedLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/3 animate-pulse"></div>
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedProjectId !== 'ALL' && t.projectId !== selectedProjectId) return false;
    if (selectedAssigneeId !== 'ALL' && t.assigneeId !== selectedAssigneeId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q);
    }
    return true;
  });

  const columns: { id: TaskStatus; label: string; color: string; border: string }[] = [
    { id: 'TODO', label: 'To Do', color: 'bg-slate-500', border: 'border-slate-300' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-600', border: 'border-blue-300' },
    { id: 'DONE', label: 'Done', color: 'bg-emerald-600', border: 'border-emerald-300' }
  ];

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTaskId) {
      moveTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Board Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter tasks by key or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Project filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.key} - {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Assignee:</span>
            <select
              value={selectedAssigneeId}
              onChange={e => setSelectedAssigneeId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3-Column Kanban Board (S-12) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
              className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col min-h-[580px] shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                    {col.label}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards Column */}
              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    <ListTodo className="w-5 h-5 mx-auto mb-1 opacity-50" />
                    <span>No tasks in this lane</span>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const isOverdue = task.dueDate < todayStr && task.status !== 'DONE';
                    const isFlashing = liveFlashKey === task.id;
                    const completedSub = task.subtasks.filter(s => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onClick={() => openTaskDrawer(task.id)}
                        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group select-none ${
                          isFlashing ? 'animate-live-flash' : ''
                        }`}
                      >
                        {/* Blocked Alert Banner if task is blocked */}
                        {task.isBlocked && (
                          <div className="mb-2.5 p-1.5 rounded-md bg-red-50 border border-red-200 text-[11px] font-semibold text-red-700 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-600" />
                            <span className="truncate">Blocked: {task.blockedReason || 'Impediment reported'}</span>
                          </div>
                        )}

                        {/* Top Key & Priority */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500">
                            {task.key}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {/* Subtasks Progress if any */}
                        {task.subtasks.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            <span>
                              {completedSub}/{task.subtasks.length} subtasks
                            </span>
                            <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full"
                                style={{ width: `${(completedSub / task.subtasks.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Card Footer: Due date + Assignee + Column Quick Mover */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-[11px] font-mono">
                            <Clock className={`w-3 h-3 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                              {task.dueDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Column mover buttons for accessibility */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {col.id !== 'TODO' && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    moveTaskStatus(task.id, col.id === 'DONE' ? 'IN_PROGRESS' : 'TODO');
                                  }}
                                  title="Move left"
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {col.id !== 'DONE' && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    moveTaskStatus(task.id, col.id === 'TODO' ? 'IN_PROGRESS' : 'DONE');
                                  }}
                                  title="Move right"
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Assignee Avatar */}
                            {assignee && (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                title={`${assignee.name} (${assignee.role})`}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
