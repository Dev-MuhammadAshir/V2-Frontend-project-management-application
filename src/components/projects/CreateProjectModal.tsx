import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../../context/AppContext';
import { useMockAuth } from '../../context/MockAuthContext';
import { X, FolderKanban, AlertCircle } from 'lucide-react';
import { Project, ProjectStatus, TaskPriority } from '../../types';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(5, 'Description is required'),
  teamId: z.string().min(1, 'Please select a team'),
  leadId: z.string().min(1, 'Please select a project lead'),
  status: z.enum(['Active', 'OnHold', 'Completed', 'Archived', 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  startDate: z.string().min(1, 'Start date required'),
  dueDate: z.string().min(1, 'Due date required'),
  budget: z.coerce.number().min(0, 'Budget must be a positive number')
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit
}) => {
  const { addProject, updateProject, teams, users } = useApp();
  const { can, currentUser } = useMockAuth();

  const isEditing = Boolean(projectToEdit);
  const isAuthorized = isEditing ? can('edit_project') : can('create_project');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      teamId: teams[0]?.id || '',
      leadId: currentUser?.id || 'usr-1',
      status: 'Active',
      priority: 'HIGH',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 100000
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        reset({
          title: projectToEdit.title,
          description: projectToEdit.description || '',
          teamId: projectToEdit.teamId,
          leadId: projectToEdit.leadId,
          status: projectToEdit.status as any,
          priority: projectToEdit.priority,
          startDate: projectToEdit.startDate,
          dueDate: projectToEdit.dueDate || projectToEdit.deadline || '',
          budget: projectToEdit.budget
        });
      } else {
        reset({
          title: '',
          description: '',
          teamId: teams[0]?.id || '',
          leadId: currentUser?.id || 'usr-1',
          status: 'Active',
          priority: 'HIGH',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: 100000
        });
      }
    }
  }, [isOpen, projectToEdit, reset, teams, currentUser]);

  if (!isOpen) return null;

  const onSubmit = (data: ProjectFormData) => {
    if (!isAuthorized) return;

    if (isEditing && projectToEdit) {
      updateProject(projectToEdit.id, {
        title: data.title,
        description: data.description,
        teamId: data.teamId,
        leadId: data.leadId,
        status: data.status as ProjectStatus,
        priority: data.priority as TaskPriority,
        startDate: data.startDate,
        dueDate: data.dueDate,
        deadline: data.dueDate,
        budget: data.budget
      });
    } else {
      addProject({
        title: data.title,
        description: data.description,
        teamId: data.teamId,
        leadId: data.leadId,
        memberIds: [data.leadId],
        status: data.status as ProjectStatus,
        priority: data.priority as TaskPriority,
        startDate: data.startDate,
        dueDate: data.dueDate,
        deadline: data.dueDate,
        budget: data.budget
      });
    }

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {isEditing ? `Edit Project: ${projectToEdit?.key || projectToEdit?.title} (S-10)` : 'Create New Project (S-10)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAuthorized ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Permission Restricted</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your current role ({currentUser?.globalRole || 'Viewer'}) does not possess permission to {isEditing ? 'modify' : 'create'} projects. Only Administrators and Project Managers can manage initiatives.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Next-Gen Cloud Orchestration Engine"
                {...register('title')}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Strategic Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Architecture goals, deliverables, and resource roadmap..."
                {...register('description')}
                className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Team</label>
                <select
                  {...register('teamId')}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Lead</label>
                <select
                  {...register('leadId')}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-900 bg-white focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role || u.globalRole})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-900 bg-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="OnHold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  {...register('budget')}
                  className="w-full text-xs font-mono rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
                {errors.budget && <p className="text-[11px] text-rose-500 mt-1">{errors.budget.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full text-xs font-mono rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full text-xs font-mono rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>
            </div>

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
                {isEditing ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
