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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-slideIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pt-10">
                    {/* Header Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${theme.bg} ${theme.iconBorder} border-2 flex items-center justify-center mb-6`}>
                        {theme.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 leading-relaxed mb-8">{message}</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-6 py-4 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${theme.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
