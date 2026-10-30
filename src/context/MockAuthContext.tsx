import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GlobalRole } from '../types';
import { initialUsers } from '../data/mockData';

export interface MockAuthContextType {
  currentUser: User | null;
  loginAs: (role: GlobalRole) => void;
  logout: () => void;
  switchRole: (role: GlobalRole) => void;
  can: (action: string, resource?: any) => boolean;

  // Dev-only Simulation toggles
  simulateLoading: boolean;
  simulateError: boolean;
  simulateEmpty: boolean;
  setSimulateLoading: (val: boolean) => void;
  setSimulateError: (val: boolean) => void;
  setSimulateEmpty: (val: boolean) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

const roleToUserMap: Record<GlobalRole, string> = {
  'Administrator': 'usr-1',   // Elena Rostova
  'Project Manager': 'usr-2', // Marcus Vance
  'Team Member': 'usr-3',     // Priya Sharma
  'Viewer': 'usr-6'           // David O'Connor
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUserId = localStorage.getItem('projectflow_auth_user_id');
    const found = initialUsers.find(u => u.id === (savedUserId || 'usr-1'));
    return found || initialUsers[0];
  });

  const [simulateLoading, setSimulateLoading] = useState<boolean>(false);
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [simulateEmpty, setSimulateEmpty] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('projectflow_auth_user_id', currentUser.id);
      localStorage.setItem('projectflow_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('projectflow_auth_user_id');
    }
  }, [currentUser]);

  const loginAs = (role: GlobalRole) => {
    const targetUserId = roleToUserMap[role] || 'usr-1';
    const targetUser = initialUsers.find(u => u.id === targetUserId) || initialUsers[0];
    setCurrentUser(targetUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: GlobalRole) => {
    const targetUserId = roleToUserMap[role] || 'usr-1';
    const targetUser = initialUsers.find(u => u.id === targetUserId) || initialUsers[0];
    setCurrentUser(targetUser);
  };

  /**
   * Authoritative RBAC check per SRS v3.0 Appendix A Permission Matrix
   */
  const can = (action: string, _resource?: any): boolean => {
    if (!currentUser) return false;
    const role = currentUser.globalRole;

    switch (action) {
      // Administrator Only
      case 'view_user_management':
      case 'manage_users':
      case 'create_user':
      case 'edit_user_role':
      case 'create_team':
      case 'reset_password':
      case 'manage_system_settings':
        return role === 'Administrator';

      // Admin + Project Manager
      case 'view_audit_logs':
      case 'manage_team_members':
      case 'create_project':
      case 'edit_project':
      case 'delete_project':
      case 'delete_task':
      case 'resolve_risk':
        return role === 'Administrator' || role === 'Project Manager';

      // Admin + Project Manager + Limited Team Member
      case 'view_pirae_risks':
        return role === 'Administrator' || role === 'Project Manager' || role === 'Team Member';

      case 'create_task':
      case 'edit_task':
      case 'kanban_drag_drop':
      case 'add_comment':
      case 'edit_comment':
      case 'upload_attachment':
        return role !== 'Viewer';

      // Universal actions
      case 'view_project':
      case 'view_task':
      case 'view_analytics':
      case 'edit_profile':
        return true;

      default:
        return role === 'Administrator';
    }
  };

  return (
    <MockAuthContext.Provider
      value={{
        currentUser,
        loginAs,
        logout,
        switchRole,
        can,
        simulateLoading,
        simulateError,
        simulateEmpty,
        setSimulateLoading,
        setSimulateError,
        setSimulateEmpty
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};
