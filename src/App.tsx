import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectDetail } from './pages/ProjectDetail';
import { KanbanBoard } from './pages/KanbanBoard';
import { TaskList } from './pages/TaskList';
import { MyTasks } from './pages/MyTasks';
import { TeamsList } from './pages/TeamsList';
import { TeamDetail } from './pages/TeamDetail';
import { UserManagement } from './pages/UserManagement';
import { Profile } from './pages/Profile';
import { NotificationCenter } from './pages/NotificationCenter';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AuditLogViewer } from './pages/AuditLogViewer';
import { PIRAERiskDashboard } from './pages/PIRAERiskDashboard';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from './pages/ErrorPages';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Screen (S-01) */}
          <Route path="/login" element={<Login />} />

          {/* Standalone Error Routes for previewing (S-30) */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />

          {/* Authenticated Application Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Project Module */}
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />

            {/* Tasks & Kanban Module */}
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/my-tasks" element={<MyTasks />} />

            {/* Teams Module */}
            <Route path="/teams" element={<TeamsList />} />
            <Route path="/teams/:teamId" element={<TeamDetail />} />

            {/* User Directory & Administration */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/profile" element={<Profile />} />

            {/* Notifications, Analytics, PIRAE Risks, Audit, Settings */}
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/risks" element={<PIRAERiskDashboard />} />
            <Route path="/audit-logs" element={<AuditLogViewer />} />
            <Route path="/settings" element={<Settings />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
