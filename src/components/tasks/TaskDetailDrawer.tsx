import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  X,
  Calendar,
  Clock,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Edit2,
  Plus,
  ArrowRight,
  ShieldAlert,
  Link as LinkIcon,
  MessageSquare,
  History
} from 'lucide-react';
import { TaskStatus, PriorityLevel } from '../../types';

export const TaskDetailDrawer: React.FC = () => {
  const {
    activeDrawerTaskId,
    closeTaskDrawer,
    tasks,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    comments,
    addComment,
    editComment,
    deleteComment,
    users,
    projects,
    currentUser,
    openTaskDrawer
  } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const task = tasks.find(t => t.id === activeDrawerTaskId);
  const project = projects.find(p => p.id === task?.projectId);
  const assignee = users.find(u => u.id === task?.assigneeId);
  const reporter = users.find(u => u.id === task?.reporterId);
  const taskComments = comments.filter(c => c.taskId === task?.id);

  if (!task) return null;

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const subtaskProgress = task.subtasks.length > 0
    ? Math.round((completedSubtasks / task.subtasks.length) * 100)
    : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;
    addComment(task.id, newCommentContent.trim());
    setNewCommentContent('');
  };

  const handleSaveEditedComment = (commentId: string) => {
    if (!editingCommentText.trim()) return;
    editComment(commentId, editingCommentText.trim());
    setEditingCommentId(null);
  };

  // Helper to check 15-minute countdown for comment editing
  const getCommentEditRemainingMinutes = (canEditUntil: string) => {
    const diffMs = new Date(canEditUntil).getTime() - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (60 * 1000));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeTaskDrawer}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              {task.key}
            </span>
            <span className="text-xs text-slate-500 truncate">{project?.title || 'Project'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeTaskDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Details & Subtasks
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'comments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({taskComments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Activity</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Blocked Alert Banner if blocked */}
              {task.isBlocked && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800">Task Execution Blocked</p>
                    <p className="mt-0.5 text-red-700 leading-relaxed">
                      {task.blockedReason || 'No specific blocker details supplied.'}
                    </p>
                  </div>
                  <button
                    onClick={() => updateTask(task.id, { isBlocked: false, blockedReason: undefined })}
                    className="px-2 py-1 rounded bg-white border border-red-300 text-red-700 hover:bg-red-100 font-medium text-[11px] cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              )}

              {/* Title input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={task.title}
                  onChange={e => updateTask(task.id, { title: e.target.value })}
                  className="w-full text-base font-semibold text-slate-900 border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Key metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50/70 border border-slate-200 text-xs">
                {/* Status */}
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Status</span>
                  <select
                    value={task.status}
                    onChange={e => updateTask(task.id, { status: e.target.value as TaskStatus })}
                    className="w-full text-xs font-semibold rounded border border-slate-200 bg-white p-1 text-slate-800 focus:outline-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Priority</span>
                  <select
                    value={task.priority}
                    onChange={e => updateTask(task.id, { priority: e.target.value as PriorityLevel })}
                    className="w-full text-xs font-semibold rounded border border-slate-200 bg-white p-1 text-slate-800 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Assignee</span>
                  <select
                    value={task.assigneeId}
                    onChange={e => updateTask(task.id, { assigneeId: e.target.value })}
                    className="w-full text-xs font-medium rounded border border-slate-200 bg-white p-1 text-slate-800 focus:outline-none truncate"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Due Date</span>
                  <input
                    type="date"
                    value={task.dueDate}
                    onChange={e => updateTask(task.id, { dueDate: e.target.value })}
                    className="w-full text-xs font-mono rounded border border-slate-200 bg-white p-1 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hours / Capacity Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Estimated Hours</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={task.estimatedHours}
                      onChange={e => updateTask(task.id, { estimatedHours: Number(e.target.value) })}
                      className="w-20 text-sm font-semibold font-mono rounded border border-slate-200 p-1 text-slate-900"
                    />
                    <span className="text-xs text-slate-500 font-mono">hrs</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-400 font-medium uppercase block mb-1">Logged Hours</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={task.actualHours}
                      onChange={e => updateTask(task.id, { actualHours: Number(e.target.value) })}
                      className="w-20 text-sm font-semibold font-mono rounded border border-slate-200 p-1 text-slate-900"
                    />
                    <span className="text-xs text-slate-500 font-mono">hrs logged</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description & Functional Specs
                </label>
                <textarea
                  rows={4}
                  value={task.description}
                  onChange={e => updateTask(task.id, { description: e.target.value })}
                  placeholder="Add clear requirements, acceptance criteria, or architectural notes..."
                  className="w-full text-xs text-slate-800 border border-slate-200 rounded-lg p-3 leading-relaxed focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Subtasks (Checklist) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Subtasks Checklist ({completedSubtasks}/{task.subtasks.length})
                  </label>
                  <span className="text-xs font-mono text-slate-500">{subtaskProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>

                {/* Subtask items */}
                <div className="space-y-1.5">
                  {task.subtasks.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubtask(task.id, sub.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        sub.completed
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                      />
                      <span className="flex-1">{sub.title}</span>
                    </div>
                  ))}
                </div>

                {/* Add Subtask form */}
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an actionable subtask..."
                    value={newSubtaskTitle}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Dependencies Section */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Task Dependencies
                </label>
                {task.dependencies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No dependencies linked to this task.</p>
                ) : (
                  <div className="space-y-1.5">
                    {task.dependencies.map((dep, idx) => {
                      const depTask = tasks.find(t => t.id === dep.taskId);
                      return (
                        <div
                          key={idx}
                          onClick={() => depTask && openTaskDrawer(depTask.id)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 text-xs cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {dep.type === 'BLOCKED_BY' ? 'BLOCKED BY' : 'BLOCKS'}
                            </span>
                            <span className="font-semibold text-slate-800">{depTask?.key}</span>
                            <span className="text-slate-600 truncate max-w-xs">{depTask?.title}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Blocker Toggle (SRS M1 / M4) */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Flag as Blocked</span>
                    <span className="text-[11px] text-slate-500">
                      Alerts sprint leads and PIRAE risk engine to bottlenecks
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={task.isBlocked}
                    onChange={e =>
                      updateTask(task.id, {
                        isBlocked: e.target.checked,
                        blockedReason: e.target.checked ? 'Awaiting external approval / resource' : undefined
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                </div>
                {task.isBlocked && (
                  <div className="mt-2.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Blocker Reason / Impediment
                    </label>
                    <input
                      type="text"
                      value={task.blockedReason || ''}
                      onChange={e => updateTask(task.id, { blockedReason: e.target.value })}
                      placeholder="e.g. Awaiting AWS database quota approval"
                      className="w-full text-xs border border-red-200 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* S-18 Comment Thread Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Mentions helper */}
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between text-[11px] text-blue-800">
                <span>Tip: Click teammate to insert @mention</span>
                <div className="flex items-center gap-1.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setNewCommentContent(prev => prev + ` @${u.name.toLowerCase().replace(' ', '.')}`)}
                      className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 font-mono text-[10px] cursor-pointer"
                    >
                      @{u.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment list */}
              <div className="space-y-4">
                {taskComments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No comments yet. Start the team discussion below!
                  </div>
                ) : (
                  taskComments.map(c => {
                    const author = users.find(u => u.id === c.authorId);
                    const isAuthor = c.authorId === currentUser.id;
                    const remainingMinutes = getCommentEditRemainingMinutes(c.canEditUntil);
                    const canEdit = isAuthor && remainingMinutes > 0;

                    return (
                      <div key={c.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={author?.avatar}
                              alt={author?.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <span className="text-xs font-semibold text-slate-900">{author?.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* 15-minute edit countdown indicator (SRS S-18 requirement) */}
                          <div className="flex items-center gap-2 text-[10px]">
                            {canEdit && (
                              <span className="text-amber-600 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {remainingMinutes}m edit window
                              </span>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingCommentText(c.content);
                                }}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Edit comment"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(canEdit || currentUser.role === 'ADMIN') && (
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {editingCommentId === c.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editingCommentText}
                              onChange={e => setEditingCommentText(e.target.value)}
                              className="w-full text-xs border border-blue-400 rounded p-2 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditedComment(c.id)}
                                className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {c.content}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rich comment input box */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-slate-200">
                <textarea
                  rows={3}
                  placeholder="Write a comment... (Markdown & @mentions supported, 15-min edit window)"
                  value={newCommentContent}
                  onChange={e => setNewCommentContent(e.target.value)}
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Posting as {currentUser.name} ({currentUser.role})
                  </span>
                  <button
                    type="submit"
                    disabled={!newCommentContent.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Audit Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Immutable Task Audit History
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">Task Initialized</span>
                    <p className="text-slate-500 text-[11px]">Created by {reporter?.name || 'System'}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">Last Telemetry State Sync</span>
                    <p className="text-slate-500 text-[11px]">Current status: {task.status}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(task.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete ${task.key}: "${task.title}"? This action is recorded in the audit trail.`}
        confirmLabel="Delete Task"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          deleteTask(task.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
