// ============================================================================
// SRS v3.0 Final Consolidated Baseline — Frontend Prototype Type Specifications
// ============================================================================

// --- Roles ---
export type GlobalRole = 'Administrator' | 'Project Manager' | 'Team Member' | 'Viewer';
export type TeamMemberRole = 'Admin-Assigned' | 'Member';
export type ProjectRole = 'Manager' | 'Contributor' | 'Viewer';

// Legacy Role alias for gradual migration
export type UserRole = GlobalRole | 'ADMIN' | 'PM' | 'ENGINEER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'INVITED';

// --- Enums (case-sensitive — matching target spec) ---
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = TaskPriority;

export type ProjectStatus =
  | 'Active'
  | 'OnHold'
  | 'Completed'
  | 'Archived'
  | 'ACTIVE'
  | 'PLANNING'
  | 'ON_HOLD'
  | 'COMPLETED';

export type RiskType =
  | 'WORKLOAD'
  | 'DELAY'
  | 'DEPENDENCY'
  | 'PRIORITY'
  | 'SCHEDULE_SLIP'
  | 'RESOURCE_OVERLOAD'
  | 'DEPENDENCY_BLOCK'
  | 'SCOPE_CREEP';

export type RiskSeverity =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL';

export type RiskStatus =
  | 'Open'
  | 'Resolved'
  | 'OPEN'
  | 'IN_REVIEW'
  | 'MITIGATED'
  | 'DISMISSED';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | string;
export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationType = 'ASSIGNMENT' | 'MENTION' | 'RISK_ALERT' | 'STATUS_CHANGE' | 'SYSTEM' | string;

export type LikelihoodLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'Low' | 'Medium' | 'High';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'Low' | 'Medium' | 'High';

// --- Core Interfaces ---

export interface User {
  id: string;                       // UUID-style string
  email: string;
  fullName?: string;
  globalRole?: GlobalRole;
  configuredCapacityHours?: number;  // 10-80, default 40
  isActive?: boolean;
  createdAt?: string;                // ISO date string
  avatarUrl?: string;                // optional for prototype

  // Prototype compatibility attributes
  name: string;
  avatar: string;
  role: UserRole;
  status: UserStatus | string;
  capacityHours: number;
  assignedHours: number;
  department: string;
  skills: string[];
  workSchedule?: string;
  phone?: string;
  timeZone?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt?: string;

  // Prototype compatibility attributes
  leadId: string;
  memberIds: string[];
  activeProjectsCount: number;
  icon?: string;
  color?: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  user?: User;                      // populated for display
  role: TeamMemberRole;
  assignedBy: string | null;
  assignedAt: string;
}

export interface Project {
  id: string;
  teamId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  deadline?: string | null;
  createdAt?: string;

  // Prototype compatibility attributes
  key: string;
  progress: number;
  startDate: string;
  dueDate: string;
  leadId: string;
  memberIds: string[];
  budget: number;
  spent: number;
  openTasksCount: number;
  completedTasksCount: number;
  risksCount: number;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  user?: User;
  role: ProjectRole;
}

export interface Subtask {
  id: string;
  title: string;
  done?: boolean;
  completed?: boolean;              // Transition compatibility
}

export interface TaskDependency {
  id: string;
  blockingTaskId: string;
  blockedTaskId: string;
  type: 'BLOCKS';
  createdAt: string;
  taskId?: string;                  // Transition compatibility
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;                  // String timestamp
  startDate?: string | null;
  estimatedEffort?: number;          // hours
  subtasks: Subtask[];
  assigneeIds?: string[];           // MULTIPLE assignees
  createdAt: string;

  // Prototype compatibility attributes
  key: string;
  isBlocked: boolean;
  blockedReason?: string;
  assigneeId: string;
  reporterId: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  dependencies: any[];
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  author?: User;
  body?: string;
  mentions?: string[];              // user ids
  createdAt: string;
  updatedAt: string | null;

  // Prototype compatibility attributes
  content: string;
  canEditUntil: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;                     // e.g., "task.assigned", "comment.created"
  payload?: Record<string, any>;
  readAt?: string | null;
  createdAt: string;

  // Prototype compatibility attributes
  title: string;
  message: string;
  read: boolean;
  link: string;
}

export interface Attachment {
  id: string;
  taskId: string | null;            // XOR with commentId
  commentId: string | null;         // XOR with taskId
  storageKey: string;               // fake key for prototype, e.g., "files/uuid.pdf"
  mimeType: string;
  fileSize: number;                 // bytes
  originalFilename: string;
  uploadedBy: string;
  createdAt: string;
}

export interface PiraeRisk {
  id: string;
  projectId: string;
  riskType?: RiskType;
  riskScore?: number;               // 0-100
  severity: RiskSeverity;
  reason: string;
  recommendation: string;
  status: RiskStatus;
  resolvedAt?: string | null;
  generatedAt?: string;

  // Prototype compatibility attributes
  title: string;
  score: number;
  type?: any;
  likelihood?: any;
  impact?: any;
  affectedTaskIds: string[];
  affectedMemberIds: string[];
  detectedAt: string;
}

// Alias for existing code
export type Risk = PiraeRisk;

export interface AuditLog {
  id: string;
  actorId: string | null;
  actor?: User;
  entityType: string;               // e.g., "task", "project"
  entityId: string;
  action: AuditAction;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  correlationId?: string;
  timestamp: string;

  // Prototype compatibility attributes
  entityName: string;
  severity: AuditSeverity;
}

export interface ProjectAnalytics {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  statusDistribution: { TODO: number; IN_PROGRESS: number; DONE: number };
  priorityDistribution: { LOW: number; MEDIUM: number; HIGH: number; CRITICAL: number };
}

export interface WorkloadEntry {
  userId: string;
  fullName: string;
  activeTaskCount: number;
  estimatedActiveHours: number;
  configuredCapacityHours: number;
  workloadRatio: number;            // estimatedActiveHours / configuredCapacityHours
  overdueCount: number;
  highPriorityActiveCount: number;
}

export interface SystemSettings {
  riskThresholdCritical: number;
  riskThresholdHigh: number;
  defaultSprintDays: number;
  maxCapacityHours: number;
  emailAlerts: boolean;
  auditRetentionDays: number;
  theme: 'light' | 'dark' | 'system';
}

export interface ActivityItem {
  id: string;
  actorId: string;
  action: string;
  target: string;
  targetType: 'task' | 'project' | 'team';
  timestamp: string;
}
