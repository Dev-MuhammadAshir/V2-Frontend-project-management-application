import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CheckSquare, Clock, Calendar, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TaskStatus } from '../types';

export const MyTasks: React.FC = () => {
  const { currentUser, tasks, projects, openTaskDrawer, moveTaskStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'dueToday' | 'overdue'>('assigned');

  const todayStr = new Date().toISOString().split('T')[0];

  const assignedToMe = tasks.filter(t => t.assigneeId === currentUser.id);
  const createdByMe = tasks.filter(t => t.reporterId === currentUser.id);
  const dueToday = assignedToMe.filter(t => t.dueDate === todayStr && t.status !== 'DONE');
  const overdue = assignedToMe.filter(t => t.dueDate < todayStr && t.status !== 'DONE');

  let currentList = assignedToMe;
  if (activeTab === 'created') currentList = createdByMe;
  if (activeTab === 'dueToday') currentList = dueToday;
  if (activeTab === 'overdue') currentList = overdue;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            My Workspace Tasks (S-16)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active assignments for <span className="font-semibold text-slate-700">{currentUser.name}</span> · {currentUser.assignedHours}h assigned this sprint
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assigned' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Assigned to Me</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono font-bold">
              {assignedToMe.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('created')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'created' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Created by Me</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono font-bold">
              {createdByMe.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dueToday')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dueToday' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Due Today</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-mono font-bold">
              {dueToday.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overdue' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Overdue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-mono font-bold">
              {overdue.length}
            </span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <EmptyState
            title="No tasks in this category"
            description="You're all caught up! You have no pending items matching this view."
          />
        ) : (
          currentList.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            const isTaskOverdue = task.dueDate < todayStr && task.status !== 'DONE';

            return (
              <div
                key={task.id}
                onClick={() => openTaskDrawer(task.id)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Status checkbox toggle */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      moveTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE');
                    }}
                    className={`mt-0.5 sm:mt-0 p-1 rounded-md border transition-colors cursor-pointer shrink-0 ${
                      task.status === 'DONE'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-blue-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {task.key}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[11px] text-slate-400 font-medium truncate">
                        {project?.title}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {task.title}
                    </h4>
                  </div>
                </div>

                {/* Right metadata and quick actions */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} isBlocked={task.isBlocked} />
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className={`w-3.5 h-3.5 ${isTaskOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span className={isTaskOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                      {task.dueDate}
                    </span>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openTaskDrawer(task.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-blue-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
