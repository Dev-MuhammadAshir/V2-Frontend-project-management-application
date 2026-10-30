import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, FileQuestion, ServerCrash, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
  code: number;
  onReset?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ code, onReset }) => {
  const navigate = useNavigate();

  let title = 'Page Not Found';
  let description = "The page or resource you are trying to access does not exist or has been relocated.";
  let Icon = FileQuestion;
  let color = 'text-amber-500 bg-amber-50 border-amber-200';

  if (code === 403) {
    title = 'Access Forbidden (403)';
    description = "You do not have the required role permissions (Admin or PM privileges required) to view this module.";
    Icon = ShieldAlert;
    color = 'text-rose-600 bg-rose-50 border-rose-200';
  } else if (code === 500) {
    title = 'Internal Platform Error (500)';
    description = "A distributed synchronization failure occurred while processing this request. Our engineering team has been notified.";
    Icon = ServerCrash;
    color = 'text-red-600 bg-red-50 border-red-200';
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
        HTTP Status {code}
      </span>
      <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex items-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Error Simulation</span>
          </button>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  return <ErrorScreen code={404} />;
};

export const ForbiddenPage: React.FC = () => {
  return <ErrorScreen code={403} />;
};

export const ServerErrorPage: React.FC = () => {
  return <ErrorScreen code={500} />;
};
