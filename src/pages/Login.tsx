import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockAuth } from '../context/MockAuthContext';
import { useApp } from '../context/AppContext';
import { GlobalRole } from '../types';
import { Zap, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginAs } = useMockAuth();
  const { setCurrentUserById, users } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('elena.rostova@projectflow.io');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<GlobalRole>('Administrator');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roleDetails: Record<GlobalRole, { name: string; email: string; id: string; desc: string }> = {
    'Administrator': {
      name: 'Elena Rostova',
      email: 'elena.rostova@projectflow.io',
      id: 'usr-1',
      desc: 'Full system governance, user provisioning & teams'
    },
    'Project Manager': {
      name: 'Marcus Vance',
      email: 'marcus.vance@projectflow.io',
      id: 'usr-2',
      desc: 'Project & task creation, risk resolution & audit'
    },
    'Team Member': {
      name: 'Priya Sharma',
      email: 'priya.sharma@projectflow.io',
      id: 'usr-3',
      desc: 'Sprint tasks execution, comment threads & uploads'
    },
    'Viewer': {
      name: "David O'Connor",
      email: 'david.oconnor@projectflow.io',
      id: 'usr-6',
      desc: 'Read-only access to authorized project dashboards'
    }
  };

  const handleRoleChange = (role: GlobalRole) => {
    setSelectedRole(role);
    setEmail(roleDetails[role].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      loginAs(selectedRole);
      const targetUserId = roleDetails[selectedRole].id;
      setCurrentUserById(targetUserId);
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleQuickSelect = (role: GlobalRole) => {
    loginAs(role);
    const targetUserId = roleDetails[role].id;
    setCurrentUserById(targetUserId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-1">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ProjectFlow</h1>
          <p className="text-xs text-slate-500">
            Real-Time Team Project Management Platform (SRS v3.0 Prototype)
          </p>
        </div>

        {/* Authentication Form (S-01 Centered Card) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Corporate Email Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@projectflow.io"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input (No 'Forgot password' link per SRS prototype scope) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Picker Dropdown (Core Prototype Requirement) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Demo Role to Authenticate As
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedRole}
                onChange={e => handleRoleChange(e.target.value as GlobalRole)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Administrator">Administrator — Elena Rostova (Full Access)</option>
                <option value="Project Manager">Project Manager — Marcus Vance (Projects & Risks)</option>
                <option value="Team Member">Team Member — Priya Sharma (Workload & Tasks)</option>
                <option value="Viewer">Viewer — David O'Connor (Read-Only Stakeholder)</option>
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {roleDetails[selectedRole].desc}
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Sign In as {selectedRole}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Click Role Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Instant 1-Click Role Access (RBAC Showcase)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {(['Administrator', 'Project Manager', 'Team Member', 'Viewer'] as GlobalRole[]).map(r => {
              const info = roleDetails[r];
              const matchedUser = users.find(u => u.id === info.id);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickSelect(r)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors flex items-center gap-2 cursor-pointer group"
                >
                  <img
                    src={matchedUser?.avatarUrl || matchedUser?.avatar}
                    alt={info.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 block truncate group-hover:text-blue-600">
                      {info.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {r}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Compliance Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Access Control Prototype Mode</span>
        </div>
      </div>
    </div>
  );
};
