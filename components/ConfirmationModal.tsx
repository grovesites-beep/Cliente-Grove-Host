import React from 'react';
import { X, AlertTriangle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'info'
}) => {
    if (!isOpen) return null;

    const themes = {
        danger: {
            icon: <Trash2 size={24} className="text-red-500" />,
            bg: 'bg-red-50',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
            iconBorder: 'border-red-100'
        },
        warning: {
            icon: <AlertTriangle size={24} className="text-amber-500" />,
            bg: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
            iconBorder: 'border-amber-100'
        },
        info: {
            icon: <HelpCircle size={24} className="text-indigo-500" />,
            bg: 'bg-indigo-50',
            button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
            iconBorder: 'border-indigo-100'
        }
    };

    const theme = themes[type];

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            {/* Modal */}
            <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-scaleIn border border-white/20">
                <div className="p-8 pb-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center`}>
                            {theme.icon}
                        </div>
                        <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-5 py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-[1.5] px-5 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${theme.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
