import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../../context/AppContext';
import { X, CheckSquare } from 'lucide-react';
import { TaskStatus, PriorityLevel } from '../../types';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  projectId: z.string().min(1, 'Please select a project'),
  assigneeId: z.string().min(1, 'Please select an assignee'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  estimatedHours: z.coerce.number().min(1, 'Estimated hours must be at least 1').max(120, 'Max 120 hours'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId
}) => {
  const { addTask, projects, users, currentUser } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      projectId: defaultProjectId || projects[0]?.id || '',
      assigneeId: currentUser.id,
      status: 'TODO',
      priority: 'MEDIUM',
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: ''
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: TaskFormData) => {
    addTask({
      title: data.title,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      reporterId: currentUser.id,
      status: data.status as TaskStatus,
      priority: data.priority as PriorityLevel,
      estimatedHours: data.estimatedHours,
      dueDate: data.dueDate,
      description: data.description || '',
      isBlocked: false,
      tags: ['Engineering'],
      subtasks: [],
      dependencies: []
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Create New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implement resilient circuit breaker on Auth Gateway"
              {...register('title')}
              className={`w-full text-xs rounded-lg border p-2.5 text-slate-900 focus:outline-none focus:ring-1 ${
                errors.title ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Project & Assignee row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('projectId')}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.key} - {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('assigneeId')}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority, Status, Hours, Due Date */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-900 bg-white focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-900 bg-white focus:outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Hours</label>
              <input
                type="number"
                min={1}
                max={120}
                {...register('estimatedHours')}
                className="w-full text-xs font-mono rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full text-xs font-mono rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide context, acceptance criteria or links..."
              {...register('description')}
              className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
