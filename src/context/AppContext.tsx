import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Team,
  TeamMember,
  TeamMemberRole,
  Project,
  ProjectMember,
  ProjectRole,
  Task,
  Comment,
  Risk,
  AuditLog,
  Notification,
  SystemSettings,
  ActivityItem,
  TaskStatus,
  UserRole,
  Attachment,
  TaskDependency
} from '../types';
import {
  initialUsers,
  initialTeams,
  initialTeamMembers,
  initialProjects,
  initialProjectMembers,
  initialTasks,
  initialComments,
  initialRisks,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
  initialActivities,
  initialAttachments,
  initialDependencies
} from '../data/mockData';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  teams: Team[];
  teamMembers: TeamMember[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  comments: Comment[];
  risks: Risk[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  settings: SystemSettings;
  activities: ActivityItem[];
  attachments: Attachment[];
  taskDependencies: TaskDependency[];
  
  // Navigation & Drawer states
  activeDrawerTaskId: string | null;
  activeRiskModalId: string | null;
  isCommandPaletteOpen: boolean;
  
  // Real-time telemetry
  realTimeConnected: boolean;
  latencyMs: number;
  liveFlashKey: string | null;
  
  // Toast notifications
  toasts: ToastItem[];
  
  // Simulation states (for SRS review)
  isSimulatedLoading: boolean;
  simulatedError: number | null;
  
  // Functions
  setCurrentUserById: (userId: string) => void;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;
  openRiskModal: (riskId: string) => void;
  closeRiskModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // CRUD & Mutations
  addTask: (task: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'actualHours'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  
  addComment: (taskId: string, content: string) => void;
  editComment: (commentId: string, newContent: string) => void;
  deleteComment: (commentId: string) => void;
  
  addProject: (project: Omit<Project, 'id' | 'key' | 'progress' | 'spent' | 'openTasksCount' | 'completedTasksCount' | 'risksCount'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  addMemberToProject: (projectId: string, userId: string, role?: ProjectRole) => void;
  removeMemberFromProject: (projectId: string, userId: string) => void;
  updateProjectMemberRole: (projectId: string, userId: string, newRole: ProjectRole) => void;
  
  addTeam: (team: Omit<Team, 'id' | 'activeProjectsCount'>) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  addMemberToTeam: (teamId: string, userId: string, role?: TeamMemberRole) => void;
  removeMemberFromTeam: (teamId: string, userId: string) => void;
  updateTeamMemberRole: (teamId: string, userId: string, newRole: TeamMemberRole) => void;
  
  addUser: (user: Omit<User, 'id' | 'assignedHours'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  toggleUserStatus: (userId: string) => void;
  
  resolveRisk: (riskId: string) => void;
  dismissRisk: (riskId: string) => void;
  addRisk: (risk: Omit<Risk, 'id' | 'detectedAt' | 'status'>) => void;
  
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  
  addAttachment: (attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  deleteAttachment: (attachmentId: string) => void;
  addDependency: (blockingTaskId: string, blockedTaskId: string) => void;
  removeDependency: (dependencyId: string) => void;

  toggleSimulatedLoading: () => void;
  setSimulatedError: (error: number | null) => void;
  triggerLiveSimulation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('projectflow_users_v3');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('projectflow_current_user_id') || 'usr-1';
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('projectflow_teams_v3');
    return saved ? JSON.parse(saved) : initialTeams;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('projectflow_team_members_v3');
    return saved ? JSON.parse(saved) : initialTeamMembers;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projectflow_projects_v3');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>(() => {
    const saved = localStorage.getItem('projectflow_project_members_v3');
    return saved ? JSON.parse(saved) : initialProjectMembers;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('projectflow_tasks_v3');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('projectflow_comments_v3');
    return saved ? JSON.parse(saved) : initialComments;
  });

  const [risks, setRisks] = useState<Risk[]>(() => {
    const saved = localStorage.getItem('projectflow_risks_v3');
    return saved ? JSON.parse(saved) : initialRisks;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('projectflow_audit_v3');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('projectflow_notifs_v3');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('projectflow_settings_v3');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const saved = localStorage.getItem('projectflow_attachments_v3');
    return saved ? JSON.parse(saved) : initialAttachments;
  });

  const [taskDependencies, setTaskDependencies] = useState<TaskDependency[]>(() => {
    const saved = localStorage.getItem('projectflow_dependencies_v3');
    return saved ? JSON.parse(saved) : initialDependencies;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  
  const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(null);
  const [activeRiskModalId, setActiveRiskModalId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Real-time telemetry
  const [realTimeConnected, setRealTimeConnected] = useState(true);
  const [latencyMs, setLatencyMs] = useState(18);
  const [liveFlashKey, setLiveFlashKey] = useState<string | null>(null);

  // Simulation controls
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);
  const [simulatedError, setSimulatedErrorState] = useState<number | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Persist critical collections
  useEffect(() => {
    localStorage.setItem('projectflow_tasks_v3', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('projectflow_projects_v3', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('projectflow_project_members_v3', JSON.stringify(projectMembers));
  }, [projectMembers]);

  useEffect(() => {
    localStorage.setItem('projectflow_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('projectflow_teams_v3', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('projectflow_team_members_v3', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('projectflow_risks_v3', JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    localStorage.setItem('projectflow_comments_v3', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('projectflow_audit_v3', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('projectflow_notifs_v3', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('projectflow_settings_v3', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('projectflow_attachments_v3', JSON.stringify(attachments));
  }, [attachments]);

  useEffect(() => {
    localStorage.setItem('projectflow_dependencies_v3', JSON.stringify(taskDependencies));
  }, [taskDependencies]);

  useEffect(() => {
    localStorage.setItem('projectflow_current_user_id', currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const recordAudit = (log: Omit<AuditLog, 'id' | 'timestamp' | 'actorId'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addActivity = (action: string, target: string, targetType: 'task' | 'project' | 'team') => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      actorId: currentUser.id,
      action,
      target,
      targetType,
      timestamp: 'Just now'
    };
    setActivities(prev => [newAct, ...prev.slice(0, 19)]);
  };

  const triggerLiveFlash = (key: string) => {
    setLiveFlashKey(key);
    setTimeout(() => setLiveFlashKey(null), 1200);
  };

  const setCurrentUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      addToast({
        type: 'info',
        title: 'Switched Active Role',
        message: `Now operating as ${found.name} (${found.role})`
      });
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic heartbeat jitter to simulate authentic live WebSocket telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyMs(Math.floor(14 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Task methods
  const addTask = (newTaskData: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'actualHours'>) => {
    const num = tasks.length + 101;
    const key = `PRF-${num}`;
    const id = `tsk-${Date.now()}`;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...newTaskData,
      id,
      key,
      actualHours: 0,
      createdAt: now,
      updatedAt: now
    };
    setTasks(prev => [newTask, ...prev]);
    recordAudit({
      action: 'CREATED_TASK',
      entityType: 'TASK',
      entityId: id,
      entityName: newTask.title,
      newValues: { status: newTask.status, priority: newTask.priority, assigneeId: newTask.assigneeId },
      severity: 'INFO'
    });
    addActivity('created task', newTask.title, 'task');
    triggerLiveFlash(id);
    addToast({
      type: 'success',
      title: 'Task Created',
      message: `${key}: ${newTask.title}`
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
          recordAudit({
            action: 'UPDATED_TASK',
            entityType: 'TASK',
            entityId: taskId,
            entityName: t.title,
            oldValues: t,
            newValues: updates,
            severity: 'INFO'
          });
          return updated;
        }
        return t;
      })
    );
    triggerLiveFlash(taskId);
    addToast({
      type: 'info',
      title: 'Task Updated',
      message: 'Changes saved successfully.'
    });
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeDrawerTaskId === taskId) {
      setActiveDrawerTaskId(null);
    }
    recordAudit({
      action: 'DELETED_TASK',
      entityType: 'TASK',
      entityId: taskId,
      entityName: task.title,
      severity: 'WARNING'
    });
    addToast({
      type: 'warning',
      title: 'Task Deleted',
      message: `${task.key} was permanently removed.`
    });
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // SRS FR-TASK-15 / FR-KAN-03: a blocked task cannot be completed
    // while any prerequisite task remains unfinished.
    if (newStatus === 'DONE') {
      const unfinishedBlockers = taskDependencies
        .filter(dependency => dependency.blockedTaskId === taskId)
        .map(dependency => tasks.find(candidate => candidate.id === dependency.blockingTaskId))
        .filter((blocker): blocker is Task => Boolean(blocker && blocker.status !== 'DONE'));

      if (unfinishedBlockers.length > 0) {
        addToast({
          type: 'warning',
          title: 'Task Is Blocked',
          message: `Complete prerequisite task(s) first: ${unfinishedBlockers.map(blocker => blocker.key).join(', ')}.`
        });
        return;
      }
    }

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );
    recordAudit({
      action: 'MOVED_TASK_STATUS',
      entityType: 'TASK',
      entityId: taskId,
      entityName: task.title,
      oldValues: { status: task.status },
      newValues: { status: newStatus },
      severity: 'INFO'
    });
    addActivity(`moved task to ${newStatus}`, task.title, 'task');
    triggerLiveFlash(taskId);
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `${task.key} is now ${newStatus.replace('_', ' ')}`
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSub: { id: string; title: string; completed: boolean } = {
      id: `sub-${Date.now()}`,
      title,
      completed: false
    };
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, newSub], updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const addComment = (taskId: string, content: string) => {
    const now = new Date();
    const canEditUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      taskId,
      authorId: currentUser.id,
      content,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      canEditUntil
    };
    setComments(prev => [...prev, newComment]);
    recordAudit({
      action: 'ADDED_COMMENT',
      entityType: 'TASK',
      entityId: taskId,
      entityName: 'Comment Thread',
      severity: 'INFO'
    });
    addToast({
      type: 'success',
      title: 'Comment Posted',
      message: 'You have 15 minutes to edit or revise your message.'
    });
  };

  const editComment = (commentId: string, newContent: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, content: newContent, updatedAt: new Date().toISOString() }
          : c
      )
    );
    addToast({
      type: 'info',
      title: 'Comment Updated',
      message: 'Revisions saved.'
    });
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    addToast({
      type: 'warning',
      title: 'Comment Deleted',
      message: 'Message was removed.'
    });
  };

  const addProject = (projectData: Omit<Project, 'id' | 'key' | 'progress' | 'spent' | 'openTasksCount' | 'completedTasksCount' | 'risksCount'>) => {
    const num = projects.length + 1;
    const id = `prj-${Date.now()}`;
    const key = `PRF-${num}`;
    const newProject: Project = {
      ...projectData,
      id,
      key,
      progress: 0,
      spent: 0,
      openTasksCount: 0,
      completedTasksCount: 0,
      risksCount: 0
    };
    setProjects(prev => [newProject, ...prev]);
    if (newProject.leadId) {
      setProjectMembers(prev => [
        ...prev,
        {
          projectId: id,
          userId: newProject.leadId,
          role: 'Manager'
        }
      ]);
    }
    recordAudit({
      action: 'CREATED_PROJECT',
      entityType: 'PROJECT',
      entityId: id,
      entityName: newProject.title,
      severity: 'INFO'
    });
    addActivity('created project', newProject.title, 'project');
    addToast({
      type: 'success',
      title: 'Project Created',
      message: `${newProject.title} is now active.`
    });
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, ...updates } : p))
    );
    addToast({
      type: 'info',
      title: 'Project Updated',
      message: 'Details saved.'
    });
  };

  const deleteProject = (projectId: string) => {
    const p = projects.find(prj => prj.id === projectId);
    if (!p) return;
    setProjects(prev => prev.filter(prj => prj.id !== projectId));
    setProjectMembers(prev => prev.filter(m => m.projectId !== projectId));
    addToast({
      type: 'warning',
      title: 'Project Archived',
      message: `${p.title} has been removed.`
    });
  };

  const addMemberToProject = (projectId: string, userId: string, role: ProjectRole = 'Contributor') => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId && !p.memberIds.includes(userId)
          ? { ...p, memberIds: [...p.memberIds, userId] }
          : p
      )
    );
    setProjectMembers(prev => {
      const exists = prev.some(m => m.projectId === projectId && m.userId === userId);
      if (exists) {
        return prev.map(m => (m.projectId === projectId && m.userId === userId ? { ...m, role } : m));
      }
      return [...prev, { projectId, userId, role }];
    });
    addToast({ type: 'success', title: 'Member Added', message: 'User added to project roster.' });
  };

  const removeMemberFromProject = (projectId: string, userId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, memberIds: p.memberIds.filter(id => id !== userId) }
          : p
      )
    );
    setProjectMembers(prev => prev.filter(m => !(m.projectId === projectId && m.userId === userId)));
    addToast({ type: 'warning', title: 'Member Removed', message: 'User removed from project roster.' });
  };

  const updateProjectMemberRole = (projectId: string, userId: string, newRole: ProjectRole) => {
    setProjectMembers(prev =>
      prev.map(m =>
        m.projectId === projectId && m.userId === userId
          ? { ...m, role: newRole }
          : m
      )
    );
    addToast({ type: 'info', title: 'Role Updated', message: `Project role set to ${newRole}.` });
  };

  const addTeam = (teamData: Omit<Team, 'id' | 'activeProjectsCount'>) => {
    const id = `tm-${Date.now()}`;
    const newTeam: Team = {
      ...teamData,
      id,
      activeProjectsCount: 0,
      createdAt: teamData.createdAt || new Date().toISOString()
    };
    setTeams(prev => [...prev, newTeam]);
    if (newTeam.leadId) {
      setTeamMembers(prev => [
        ...prev,
        {
          teamId: id,
          userId: newTeam.leadId,
          role: 'Admin-Assigned',
          assignedBy: currentUserId,
          assignedAt: new Date().toISOString()
        }
      ]);
    }
    addToast({
      type: 'success',
      title: 'Team Created',
      message: `${newTeam.name} added.`
    });
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, ...updates } : t)));
    addToast({ type: 'info', title: 'Team Updated', message: 'Team details saved.' });
  };

  const addMemberToTeam = (teamId: string, userId: string, role: TeamMemberRole = 'Member') => {
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId && !t.memberIds.includes(userId)
          ? { ...t, memberIds: [...t.memberIds, userId] }
          : t
      )
    );
    setTeamMembers(prev => {
      const exists = prev.some(m => m.teamId === teamId && m.userId === userId);
      if (exists) {
        return prev.map(m => (m.teamId === teamId && m.userId === userId ? { ...m, role } : m));
      }
      return [
        ...prev,
        {
          teamId,
          userId,
          role,
          assignedBy: currentUserId,
          assignedAt: new Date().toISOString()
        }
      ];
    });
    addToast({ type: 'success', title: 'Member Added', message: 'User added to team.' });
  };

  const removeMemberFromTeam = (teamId: string, userId: string) => {
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId
          ? { ...t, memberIds: t.memberIds.filter(id => id !== userId) }
          : t
      )
    );
    setTeamMembers(prev => prev.filter(m => !(m.teamId === teamId && m.userId === userId)));
    addToast({ type: 'warning', title: 'Member Removed', message: 'User removed from team roster.' });
  };

  const updateTeamMemberRole = (teamId: string, userId: string, newRole: TeamMemberRole) => {
    setTeamMembers(prev =>
      prev.map(m =>
        m.teamId === teamId && m.userId === userId
          ? { ...m, role: newRole }
          : m
      )
    );
    addToast({ type: 'info', title: 'Role Updated', message: `Team role set to ${newRole}.` });
  };

  const addUser = (userData: Omit<User, 'id' | 'assignedHours'>) => {
    const id = `usr-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id,
      assignedHours: 0
    };
    setUsers(prev => [...prev, newUser]);
    addToast({ type: 'success', title: 'User Created', message: `${newUser.name} added to workspace.` });
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    addToast({ type: 'info', title: 'User Updated', message: 'Profile details saved.' });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const resolveRisk = (riskId: string) => {
    setRisks(prev =>
      prev.map(r => (r.id === riskId ? { ...r, status: 'MITIGATED' } : r))
    );
    recordAudit({
      action: 'RESOLVED_PIRAE_RISK',
      entityType: 'RISK',
      entityId: riskId,
      entityName: 'PIRAE Risk Item',
      severity: 'INFO'
    });
    addToast({
      type: 'success',
      title: 'Risk Mitigated',
      message: 'Resolution logged and team notified.'
    });
  };

  const dismissRisk = (riskId: string) => {
    setRisks(prev =>
      prev.map(r => (r.id === riskId ? { ...r, status: 'DISMISSED' } : r))
    );
    addToast({
      type: 'info',
      title: 'Risk Dismissed',
      message: 'Item removed from primary alert queue.'
    });
  };

  const addRisk = (riskData: Omit<Risk, 'id' | 'detectedAt' | 'status'>) => {
    const id = `rsk-${Date.now()}`;
    const newRisk: Risk = {
      ...riskData,
      id,
      status: 'OPEN',
      detectedAt: new Date().toISOString()
    };
    setRisks(prev => [newRisk, ...prev]);
    recordAudit({
      action: 'DETECTED_PIRAE_RISK',
      entityType: 'RISK',
      entityId: id,
      entityName: newRisk.title,
      severity: newRisk.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING'
    });
    addToast({
      type: 'warning',
      title: 'New Risk Detected',
      message: newRisk.title
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast({ type: 'info', title: 'Notifications Cleared', message: 'All marked as read.' });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    recordAudit({
      action: 'SYSTEM_SETTINGS_UPDATE',
      entityType: 'SETTINGS',
      entityId: 'sys-config',
      entityName: 'Workspace Settings',
      severity: 'WARNING'
    });
    addToast({ type: 'success', title: 'Settings Saved', message: 'PIRAE and system rules updated.' });
  };

  const addAttachment = (newAtt: Omit<Attachment, 'id' | 'createdAt'>) => {
    const att: Attachment = {
      ...newAtt,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAttachments(prev => [att, ...prev]);
    addToast({
      type: 'success',
      title: 'Attachment Added',
      message: `Uploaded ${att.originalFilename}`
    });
  };

  const deleteAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
    addToast({
      type: 'info',
      title: 'Attachment Removed',
      message: 'File reference removed from workspace.'
    });
  };

  const addDependency = (blockingTaskId: string, blockedTaskId: string) => {
    if (blockingTaskId === blockedTaskId) {
      addToast({
        type: 'error',
        title: 'Invalid Dependency',
        message: 'A task cannot depend on itself.'
      });
      return;
    }

    const blockingTask = tasks.find(task => task.id === blockingTaskId);
    const blockedTask = tasks.find(task => task.id === blockedTaskId);
    if (!blockingTask || !blockedTask) {
      addToast({ type: 'error', title: 'Invalid Dependency', message: 'Both tasks must exist.' });
      return;
    }
    if (blockingTask.projectId !== blockedTask.projectId) {
      addToast({ type: 'error', title: 'Invalid Dependency', message: 'Dependencies must stay within the same project.' });
      return;
    }

    // Adding A -> B is invalid if B already reaches A (that would create a cycle).
    const reaches = (fromTaskId: string, targetTaskId: string, visited = new Set<string>()): boolean => {
      if (fromTaskId === targetTaskId) return true;
      if (visited.has(fromTaskId)) return false;
      visited.add(fromTaskId);
      return taskDependencies
        .filter(dependency => dependency.blockingTaskId === fromTaskId)
        .some(dependency => reaches(dependency.blockedTaskId, targetTaskId, visited));
    };
    if (reaches(blockedTaskId, blockingTaskId)) {
      addToast({ type: 'error', title: 'Dependency Cycle', message: 'This link would create a circular dependency.' });
      return;
    }

    const exists = taskDependencies.some(
      d => d.blockingTaskId === blockingTaskId && d.blockedTaskId === blockedTaskId
    );
    if (exists) {
      addToast({
        type: 'warning',
        title: 'Duplicate Dependency',
        message: 'This dependency relationship already exists.'
      });
      return;
    }
    const newDep: TaskDependency = {
      id: `dep-${Date.now()}`,
      blockingTaskId,
      blockedTaskId,
      type: 'BLOCKS',
      createdAt: new Date().toISOString()
    };
    setTaskDependencies(prev => [...prev, newDep]);
    addToast({
      type: 'success',
      title: 'Dependency Linked',
      message: 'Task dependency recorded in relational graph.'
    });
  };

  const removeDependency = (depId: string) => {
    setTaskDependencies(prev => prev.filter(d => d.id !== depId));
    addToast({
      type: 'info',
      title: 'Dependency Removed',
      message: 'Dependency constraint cleared.'
    });
  };

  const toggleSimulatedLoading = () => {
    setIsSimulatedLoading(prev => !prev);
  };

  const setSimulatedError = (code: number | null) => {
    setSimulatedErrorState(code);
  };

  const triggerLiveSimulation = () => {
    // Simulate incoming real-time socket event
    const randomTaskId = tasks[Math.floor(Math.random() * tasks.length)]?.id;
    if (randomTaskId) {
      triggerLiveFlash(randomTaskId);
    }
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Real-Time Sync Pulse',
      message: 'Telemetry synchronized across all client nodes at ' + new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      read: false,
      link: '/kanban',
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
    addToast({
      type: 'info',
      title: 'Live WebSocket Event',
      message: 'Data synchronization event received from cluster.'
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        teams,
        teamMembers,
        projects,
        projectMembers,
        tasks,
        comments,
        risks,
        auditLogs,
        notifications,
        settings,
        activities,
        activeDrawerTaskId,
        activeRiskModalId,
        isCommandPaletteOpen,
        realTimeConnected,
        latencyMs,
        liveFlashKey,
        toasts,
        isSimulatedLoading,
        simulatedError,
        setCurrentUserById,
        openTaskDrawer: (id: string) => setActiveDrawerTaskId(id),
        closeTaskDrawer: () => setActiveDrawerTaskId(null),
        openRiskModal: (id: string) => setActiveRiskModalId(id),
        closeRiskModal: () => setActiveRiskModalId(null),
        setCommandPaletteOpen: setIsCommandPaletteOpen,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        addSubtask,
        addComment,
        editComment,
        deleteComment,
        addProject,
        updateProject,
        deleteProject,
        addMemberToProject,
        removeMemberFromProject,
        updateProjectMemberRole,
        addTeam,
        updateTeam,
        addMemberToTeam,
        removeMemberFromTeam,
        updateTeamMemberRole,
        addUser,
        updateUser,
        toggleUserStatus,
        resolveRisk,
        dismissRisk,
        addRisk,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        attachments,
        taskDependencies,
        addAttachment,
        deleteAttachment,
        addDependency,
        removeDependency,
        updateSettings,
        addToast,
        dismissToast,
        toggleSimulatedLoading,
        setSimulatedError,
        triggerLiveSimulation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
