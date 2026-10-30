import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, Users, ShieldAlert, ArrowRight, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, tasks, projects, teams, users, openTaskDrawer } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return {
        tasks: tasks.slice(0, 4),
        projects: projects.slice(0, 3),
        teams: teams.slice(0, 2),
        users: users.slice(0, 3)
      };
    }
    const q = query.toLowerCase();
    return {
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q)).slice(0, 5),
      projects: projects.filter(p => p.title.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)).slice(0, 4),
      teams: teams.filter(tm => tm.name.toLowerCase().includes(q)).slice(0, 3),
      users: users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3)
    };
  }, [query, tasks, projects, teams, users]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, projects, teams, people... (Esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {/* Quick Tasks */}
          {filteredItems.tasks.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tasks</span>
              <div className="mt-1 space-y-0.5">
                {filteredItems.tasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      openTaskDrawer(t.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-mono text-slate-400 shrink-0">{t.key}</span>
                      <span className="text-xs font-medium text-slate-800 truncate">{t.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredItems.projects.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Projects</span>
              <div className="mt-1 space-y-0.5">
                {filteredItems.projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigate(`/projects/${p.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs font-mono text-slate-400 shrink-0">{p.key}</span>
                      <span className="text-xs font-medium text-slate-800 truncate">{p.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teams & Users */}
          {(filteredItems.teams.length > 0 || filteredItems.users.length > 0) && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Teams & Teammates</span>
              <div className="mt-1 space-y-0.5">
                {filteredItems.teams.map(tm => (
                  <button
                    key={tm.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigate(`/teams/${tm.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 truncate">{tm.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
                  </button>
                ))}
                {filteredItems.users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigate('/users');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-xs font-medium text-slate-800 truncate">{u.name}</span>
                      <span className="text-xs text-slate-400 truncate">({u.role})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">↵</kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>PIRAE Risk Intelligence active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
