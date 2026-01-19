import React, { useState, useRef } from 'react';
import { ClientData, SiteType } from '../types';
import {
    X, Upload, User, Building2, Mail, Phone, MapPin,
    Globe, Lock, Save, Camera, Check, Trash2
} from 'lucide-react';
import { useToastContext } from '../contexts/ToastContext';

interface ClientEditModalProps {
    client: ClientData;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updated: ClientData) => void;
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({
    client,
    isOpen,
    onClose,
    onSave
}) => {
    const [editedData, setEditedData] = useState<ClientData>({ ...client });
    const [imagePreview, setImagePreview] = useState<string | null>(client.avatar || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToastContext();

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setEditedData(prev => ({ ...prev, avatar: result }));
            };
            reader.readAsDataURL(file);
            toast.success("Foto carregada com sucesso!");
        }
    };

    const handleSave = () => {
        onSave(editedData);
        toast.success("Dados do cliente atualizados com sucesso!");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scaleIn border border-white/20">
                {/* Header - Compact & Clean */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">Editar Cliente</h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{client.company}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Profile Quick View & Basic Auth */}
                    <div className="w-72 border-r border-slate-50 bg-slate-50/30 p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-slate-200" />
                                    )}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-3xl backdrop-blur-[2px]"
                                    >
                                        <Camera size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">Trocar</span>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-800 leading-none mb-1">{editedData.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">ID #{client.id.slice(0, 6)}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Acesso ao Portal</p>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase">E-mail</label>
                                    <input
                                        type="email"
                                        value={editedData.email}
                                        onChange={e => setEditedData({ ...editedData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 pl-1 uppercase">Senha</label>
                                    <input
                                        type="password"
                                        value={editedData.password || ''}
                                        onChange={e => setEditedData({ ...editedData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Detailed Form Sections */}
                    <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-white">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">

                            {/* Company Section */}
                            <div className="col-span-2">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Informações do Negócio</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Nome Fantasia / Empresa</label>
                                        <input
                                            type="text"
                                            value={editedData.company}
                                            onChange={e => setEditedData({ ...editedData, company: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Domínio (URL)</label>
                                        <input
                                            type="text"
                                            value={editedData.siteUrl}
                                            onChange={e => setEditedData({ ...editedData, siteUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Tipo de Site</label>
                                        <select
                                            value={editedData.siteType}
                                            onChange={e => setEditedData({ ...editedData, siteType: e.target.value as SiteType })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white transition-all shadow-sm"
                                        >
                                            {Object.values(SiteType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">WhatsApp / Contato</label>
                                        <input
                                            type="text"
                                            value={editedData.phone || ''}
                                            onChange={e => setEditedData({ ...editedData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="col-span-2 mt-4">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Endereço & Localização</p>
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-10 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Rua / Avenida</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.street || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), street: e.target.value } })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Nº</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.number || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), number: e.target.value } })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-center focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="col-span-6 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.city || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), city: e.target.value } })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">UF</label>
                                        <input
                                            type="text"
                                            maxLength={2}
                                            value={editedData.address?.state || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), state: e.target.value.toUpperCase() } })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-center focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1">CEP</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.zipCode || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), zipCode: e.target.value } })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Elegant & Concise */}
                <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <button onClick={onClose} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.03] active:scale-[0.97] transition-all"
                    >
                        <Check size={18} />
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};
