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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Editar Cadastro</h2>
                        <p className="text-sm text-slate-500 font-medium">Atualize todas as informações de {client.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-md transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Left: Avatar & Profile Basic */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-center lg:text-left">Foto do Cliente</label>
                                <div className="relative group mx-auto lg:mx-0 w-48 h-48">
                                    <div className="w-full h-full rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100 flex items-center justify-center relative">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <User size={48} className="opacity-20" />
                                                <span className="text-xs font-bold uppercase tracking-tighter opacity-40">Sem Foto</span>
                                            </div>
                                        )}

                                        {/* Overlay de Upload */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-indigo-600/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white cursor-pointer"
                                        >
                                            <Camera size={24} className="mb-2 translate-y-2 group-hover:translate-y-0 transition-transform" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Alterar Foto</span>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    {imagePreview && (
                                        <button
                                            onClick={() => { setImagePreview(null); setEditedData(prev => ({ ...prev, avatar: undefined })); }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-6 rounded-[30px] border border-indigo-100/50 space-y-4">
                                <h3 className="text-sm font-bold text-indigo-900 border-b border-indigo-100/50 pb-3">Informações de Login</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1">E-mail de Acesso</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                                        <input
                                            type="email"
                                            value={editedData.email}
                                            onChange={e => setEditedData({ ...editedData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm font-medium text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1">Senha do Portal</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                                        <input
                                            type="password"
                                            value={editedData.password || ''}
                                            onChange={e => setEditedData({ ...editedData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-300 text-sm font-medium text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Detailed Tabs/Fields */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Section: Basic Data */}
                            <section className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                    Dados Cadastrais
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={editedData.name}
                                                onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Empresa</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={editedData.company}
                                                onChange={e => setEditedData({ ...editedData, company: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">WhatsApp / Telefone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={editedData.phone || ''}
                                                onChange={e => setEditedData({ ...editedData, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Responsável Interno</label>
                                        <input
                                            type="text"
                                            value={editedData.responsiblePerson || ''}
                                            onChange={e => setEditedData({ ...editedData, responsiblePerson: e.target.value })}
                                            placeholder="Nome do contato principal"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section: Website */}
                            <section className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                    Presença Digital
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Domínio (URL)</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={editedData.siteUrl}
                                                onChange={e => setEditedData({ ...editedData, siteUrl: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Tipo de Projeto</label>
                                        <select
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
                                            value={editedData.siteType}
                                            onChange={e => setEditedData({ ...editedData, siteType: e.target.value as SiteType })}
                                        >
                                            {Object.values(SiteType).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Address */}
                            <section className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                    Localização
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
                                    <div className="space-y-2 md:col-span-8">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Endereço / Logradouro</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={editedData.address?.street || ''}
                                                onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), street: e.target.value } })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Número</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.number || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), number: e.target.value } })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.city || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), city: e.target.value } })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">UF</label>
                                        <input
                                            type="text"
                                            maxLength={2}
                                            value={editedData.address?.state || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), state: e.target.value.toUpperCase() } })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center uppercase font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">CEP</label>
                                        <input
                                            type="text"
                                            value={editedData.address?.zipCode || ''}
                                            onChange={e => setEditedData({ ...editedData, address: { ...(editedData.address || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }), zipCode: e.target.value } })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                    >
                        Descartar Alterações
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-extrabold shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Save size={20} />
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};
