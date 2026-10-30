import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { ToastContainer } from '../components/common/ToastContainer';
import { CommandPalette } from '../components/common/CommandPalette';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { RiskDetailModal } from '../components/risks/RiskDetailModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { useApp } from '../context/AppContext';
import { ErrorScreen } from '../pages/ErrorPages';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);

  // Responsive tablet auto-collapse (768px <= width < 1024px)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });

  const { simulatedError, setSimulatedError } = useApp();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex">
      {/* Sidebar: 240px (w-60) collapsible to 64px (w-16) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(prev => !prev)}
      />

      {/* Main Container dynamically padded according to sidebar width */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:pl-16' : 'md:pl-60'
        }`}
      >
        {/* 64px Topbar */}
        <Topbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenCreateTask={() => setCreateTaskModalOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {simulatedError ? (
            <ErrorScreen
              code={simulatedError}
              onReset={() => setSimulatedError(null)}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <ToastContainer />
      <CommandPalette />
      <TaskDetailDrawer />
      <RiskDetailModal />
      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
      />
    </div>
  );
};
