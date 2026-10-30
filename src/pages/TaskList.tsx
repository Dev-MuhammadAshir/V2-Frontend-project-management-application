import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { TaskStatus, PriorityLevel } from '../types';

export const TaskList: React.FC = () => {
  const {
    tasks,
    users,
    projects,
    openTaskDrawer,
    moveTaskStatus,
    deleteTask,
    isSimulatedLoading,
    liveFlashKey
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  if (isSimulatedLoading) {
    return <TableSkeleton rows={8} />;
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === 'dueDate') {
      return sortAsc ? a.dueDate.localeCompare(b.dueDate) : b.dueDate.localeCompare(a.dueDate);
    }
    if (sortField === 'title') {
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    return 0;
  });

  const handleToggleSelect = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === sortedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(sortedTasks.map(t => t.id));
    }
  };

  const handleBulkComplete = () => {
    selectedTaskIds.forEach(id => moveTaskStatus(id, 'DONE'));
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    selectedTaskIds.forEach(id => deleteTask(id));
    setSelectedTaskIds([]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task table..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Bulk actions banner if any selected */}
          {selectedTaskIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-semibold text-blue-700">
                {selectedTaskIds.length} selected
              </span>
              <button
                onClick={handleBulkComplete}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Mark Done
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-[11px] font-medium text-rose-600 hover:text-rose-800 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {sortedTasks.length === 0 ? (
          <EmptyState
            title="No tasks match the filters"
            description="Try relaxing your search query or changing status filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium select-none">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === sortedTasks.length && sortedTasks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Key</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-slate-900"
                    onClick={() => {
                      if (sortField === 'title') setSortAsc(!sortAsc);
                      else {
                        setSortField('title');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Task Title</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-slate-900"
                    onClick={() => {
                      if (sortField === 'dueDate') setSortAsc(!sortAsc);
                      else {
                        setSortField('dueDate');
                        setSortAsc(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Due Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Est. Hours</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const isSelected = selectedTaskIds.includes(task.id);
                  const isOverdue = task.dueDate < todayStr && task.status !== 'DONE';
                  const isFlashing = liveFlashKey === task.id;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      } ${isFlashing ? 'animate-live-flash' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(task.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-500">
                        {task.key}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          onClick={() => openTaskDrawer(task.id)}
                          className="cursor-pointer hover:text-blue-600 transition-colors font-medium text-slate-900 max-w-sm truncate"
                        >
                          {task.title}
                        </div>
                        {task.isBlocked && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-medium mt-0.5">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Blocked</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={task.status} isBlocked={task.isBlocked} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                            <span className="text-xs text-slate-700 truncate">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {task.dueDate}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-700 tabular-nums">
                        {task.estimatedHours}h
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openTaskDrawer(task.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
