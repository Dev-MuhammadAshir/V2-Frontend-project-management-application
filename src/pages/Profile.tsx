import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Sliders, Clock, Mail, Phone, Save, Plus, X, Lock, CheckCircle2 } from 'lucide-react';
import { RoleBadge } from '../components/common/Badge';

export const Profile: React.FC = () => {
  const { currentUser, updateUser, addToast } = useApp();
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Local state for profile editing (S-03)
  const [fullName, setFullName] = useState(currentUser.fullName || currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-8901');
  const [department, setDepartment] = useState(currentUser.department || 'Engineering');
  const [configuredCapacityHours, setConfiguredCapacityHours] = useState<number>(
    currentUser.configuredCapacityHours || currentUser.capacityHours || 40
  );
  const [workSchedule, setWorkSchedule] = useState(currentUser.workSchedule || 'Mon-Fri 09:00 - 17:00 EST');
  const [timeZone, setTimeZone] = useState(currentUser.timeZone || 'America/New_York');
  const [skills, setSkills] = useState<string[]>(currentUser.skills || []);
  const [newSkill, setNewSkill] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Work preferences state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [workloadAlerts, setWorkloadAlerts] = useState(true);
  const [mentionAlerts, setMentionAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      fullName,
      name: fullName,
      email,
      phone,
      department,
      configuredCapacityHours: Number(configuredCapacityHours),
      capacityHours: Number(configuredCapacityHours),
      workSchedule,
      timeZone,
      skills
    });
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal details and capacity hours were saved successfully.'
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation password do not match.'
      });
      return;
    }
    if (newPassword.length < 8) {
      addToast({
        type: 'error',
        title: 'Weak Password',
        message: 'Password must contain at least 8 characters with upper, lower, and numeric characters.'
      });
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your security password has been updated across active sessions.'
      });
    }, 500);
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Preferences Saved',
      message: `Theme set to ${theme} and alert preferences updated.`
    });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (S-03) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || currentUser.avatar}
            alt={currentUser.fullName || currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {currentUser.fullName || currentUser.name}
              </h1>
              <RoleBadge role={currentUser.globalRole || currentUser.role} />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {currentUser.email} · {currentUser.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
          <Clock className="w-5 h-5 text-blue-600" />
          <div className="text-xs">
            <span className="text-[10px] text-blue-600 uppercase font-semibold block tracking-wider">
              Weekly Capacity
            </span>
            <span className="font-mono font-bold text-blue-900 text-sm">
              {configuredCapacityHours} Hours / Week
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav (S-03) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1 h-fit">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Capacity</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
              activeSection === 'security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveSection('preferences')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
              activeSection === 'preferences'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Theme & Alerts</span>
          </button>
        </div>

        {/* Right Content */}
        <div className="md:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          {/* TAB 1: Profile & Capacity Form */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Personal & Capacity Settings (S-03)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your display name, contact coordinates, and sprint capacity limits.
                </p>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Configured Capacity Hours (CHECK 10-80 Hours per SRS §6.2) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-900 block text-xs">
                      Weekly Configured Capacity Hours (SRS S-03 / §6.2)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Permitted range: 10 to 80 hours/week. Used by PIRAE engine to calculate workload overload.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-base font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1 rounded-lg">
                    <span>{configuredCapacityHours}</span>
                    <span className="text-xs text-slate-500 font-sans">hrs/wk</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-slate-400">10h</span>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={1}
                    value={configuredCapacityHours}
                    onChange={e => setConfiguredCapacityHours(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[11px] font-mono text-slate-400">80h</span>
                </div>
              </div>

              {/* Department & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Schedule & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Schedule</label>
                  <input
                    type="text"
                    value={workSchedule}
                    onChange={e => setWorkSchedule(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                  <select
                    value={timeZone}
                    onChange={e => setTimeZone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Engineering & Design Skills</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm mt-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Kubernetes, React)..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Capacity</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Password Change */}
          {activeSection === 'security' && (
            <div className="space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Security Credentials & Password (S-03)</h3>
                <p className="text-slate-500 mt-0.5">
                  Manage your account password and review multi-factor authentication status.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 special"
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isChangingPassword ? 'Updating Password...' : 'Update Password (Mock)'}</span>
                </button>
              </form>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">Two-Factor Authentication (TOTP)</p>
                    <p className="text-[11px] text-slate-500">Enforced by Zero-Trust SOC2 enterprise policy</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ENABLED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Preferences & Theme */}
          {activeSection === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Workspace Theme & Alerts (S-03)</h3>
                <p className="text-slate-500 mt-0.5">
                  Configure visual appearance and real-time alert preferences.
                </p>
              </div>

              {/* Theme Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Display Theme</label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {(['light', 'dark', 'system'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`p-3 rounded-lg border text-center font-medium capitalize cursor-pointer transition-all ${
                        theme === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50/50">
                  <input
                    type="checkbox"
                    checked={workloadAlerts}
                    onChange={e => setWorkloadAlerts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">PIRAE Workload Over-Allocation Alerts</p>
                    <p className="text-[11px] text-slate-500">
                      Notify me immediately when weekly assigned hours exceed my {configuredCapacityHours}h limit
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50/50">
                  <input
                    type="checkbox"
                    checked={mentionAlerts}
                    onChange={e => setMentionAlerts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Comment Mentions & Task Notifications</p>
                    <p className="text-[11px] text-slate-500">
                      Receive notifications when tagged in discussions or assigned to new tasks
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
