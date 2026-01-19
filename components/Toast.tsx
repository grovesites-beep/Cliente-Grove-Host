import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
    const config = {
        success: {
            icon: <CheckCircle2 size={20} className="text-emerald-500" />,
            bgColor: 'bg-white/80',
            borderColor: 'border-emerald-100',
            progressColor: 'bg-emerald-500',
            glow: 'shadow-emerald-500/10'
        },
        error: {
            icon: <XCircle size={20} className="text-rose-500" />,
            bgColor: 'bg-white/80',
            borderColor: 'border-rose-100',
            progressColor: 'bg-rose-500',
            glow: 'shadow-rose-500/10'
        },
        warning: {
            icon: <AlertCircle size={20} className="text-amber-500" />,
            bgColor: 'bg-white/80',
            borderColor: 'border-amber-100',
            progressColor: 'bg-amber-500',
            glow: 'shadow-amber-500/10'
        },
        info: {
            icon: <Info size={20} className="text-indigo-500" />,
            bgColor: 'bg-white/80',
            borderColor: 'border-indigo-100',
            progressColor: 'bg-indigo-500',
            glow: 'shadow-indigo-500/10'
        },
    };

    const theme = config[type];

    return (
        <div className={`
            ${theme.bgColor} ${theme.borderColor} ${theme.glow}
            border backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center gap-4 
            min-w-[320px] max-w-md relative overflow-hidden animate-slideIn
        `}>
            <div className="shrink-0">
                {theme.icon}
            </div>

            <div className="flex-1">
                <p className="text-slate-800 font-bold text-sm tracking-tight">{message}</p>
            </div>

            <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
                <X size={16} />
            </button>

            {/* Progress Bar Animation */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-100/50">
                <div
                    className={`h-full ${theme.progressColor} animate-progress`}
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};
