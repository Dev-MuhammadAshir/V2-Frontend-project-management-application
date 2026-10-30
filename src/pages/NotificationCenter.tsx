import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Filter, ExternalLink, ShieldAlert, CheckSquare, MessageSquare, AlertCircle } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationType } from '../types';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    openTaskDrawer,
    openRiskModal
  } = useApp();

  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    return true;
  });

  const handleItemClick = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.link.includes('task=')) {
      const taskId = n.link.split('task=')[1];
      openTaskDrawer(taskId);
    } else if (n.link === '/risks') {
      navigate('/risks');
    } else {
      navigate(n.link);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'RISK_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'ASSIGNMENT':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'MENTION':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Notification Center (S-20)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of task assignments, @mentions, and PIRAE risk heuristics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={clearNotifications}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-rose-600 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Feed</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'All Items' },
          { id: 'UNREAD', label: 'Unread Only' },
          { id: 'RISK_ALERT', label: 'PIRAE Risks' },
          { id: 'MENTION', label: 'Mentions' },
          { id: 'ASSIGNMENT', label: 'Task Assignments' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <EmptyState
            title="No notifications in this view"
            description="All messages have been acknowledged."
          />
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                !n.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-right">
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300 hover:text-blue-600" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
