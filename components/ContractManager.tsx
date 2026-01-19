import React, { useState } from 'react';
import { ClientData, Contract } from '../types';
import {
    Plus, Search, FileText, Calendar, DollarSign,
    MoreVertical, Download, Trash2, Check, X, AlertCircle,
    Building2, Clock, CheckCircle2
} from 'lucide-react';
import { formatCurrencyBR, formatDateBR } from '../utils/formatters';
import { useToastContext } from '../contexts/ToastContext';
import { ContractPreviewModal } from './ContractPreviewModal';

interface ContractManagerProps {
    clients: ClientData[];
    onUpdateClient: (clientId: string, updates: Partial<ClientData>) => void;
}

export const ContractManager: React.FC<ContractManagerProps> = ({ clients, onUpdateClient }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [newContract, setNewContract] = useState<Partial<Contract>>({
        title: '',
        startDate: '',
        endDate: '',
        value: 0,
        status: 'active'
    });
    const [previewItem, setPreviewItem] = useState<{ contract: Contract, client: ClientData } | null>(null);
    const toast = useToastContext();

    const allContracts = clients.flatMap(client =>
        (client.contracts || []).map(contract => ({ ...contract, clientName: client.name, clientCompany: client.company, clientId: client.id }))
    ).filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddContract = () => {
        if (!selectedClient || !newContract.title || !newContract.startDate || !newContract.endDate) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const client = clients.find(c => c.id === selectedClient);
        if (client) {
            const contract: Contract = {
                id: Date.now().toString(),
                title: newContract.title!,
                startDate: newContract.startDate!,
                endDate: newContract.endDate!,
                value: newContract.value || 0,
                status: newContract.status as any || 'active'
            };

            const updatedContracts = [...(client.contracts || []), contract];
            onUpdateClient(client.id, { contracts: updatedContracts });
            toast.success("Contrato adicionado com sucesso!");
            setIsFormOpen(false);
            setNewContract({ title: '', startDate: '', endDate: '', value: 0, status: 'active' });
            setSelectedClient('');
        }
    };

    const handleDeleteContract = (clientId: string, contractId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const updatedContracts = client.contracts?.filter(c => c.id !== contractId) || [];
            onUpdateClient(clientId, { contracts: updatedContracts });
            toast.success("Contrato removido.");
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center text-slate-800">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Gestão de Contratos</h2>
                    <p className="text-slate-500 mt-1">Total de {allContracts.length} contratos ativos na base</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-[20px] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} /> Novo Contrato
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <FileText size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total de Contratos</p>
                        <p className="text-2xl font-black text-slate-800">{allContracts.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vigência Total</p>
                        <p className="text-2xl font-black text-slate-800">{formatCurrencyBR(allContracts.reduce((acc, c) => acc + c.value, 0))}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">A Vencer (30 dias)</p>
                        <p className="text-2xl font-black text-slate-800">2</p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título, cliente ou empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contrato / Cliente</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Início / Fim</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Valor Anual</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {allContracts.length > 0 ? allContracts.map(contract => (
                            <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center text-slate-400 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{contract.title}</p>
                                            <p className="text-xs text-slate-500 font-medium">{contract.clientCompany}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <p className="text-sm font-bold text-slate-700">{formatDateBR(contract.startDate)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Até {formatDateBR(contract.endDate)}</p>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="text-sm font-black text-indigo-600">{formatCurrencyBR(contract.value)}</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${contract.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {contract.status === 'active' ? '● Ativo' : '○ Expirado'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                const cl = clients.find(c => c.id === contract.clientId);
                                                if (cl) setPreviewItem({ contract, client: cl });
                                            }}
                                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all"
                                            title="Ver / Imprimir Contrato"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all">
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContract(contract.clientId, contract.id)}
                                            className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:shadow-md transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center">
                                            <FileText size={40} />
                                        </div>
                                        <p className="text-slate-400 font-bold">Nenhum contrato encontrado</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-scaleIn">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800">Novo Contrato</h3>
                                <p className="text-sm text-slate-500 font-medium">Cadastre um novo acordo comercial</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Cliente / Empresa</label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Título do Contrato</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Manutenção de Software v2"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    value={newContract.title}
                                    onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Data de Início</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        value={newContract.startDate}
                                        onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Data de Término</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        value={newContract.endDate}
                                        onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Valor do Contrato</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            value={newContract.value}
                                            onChange={(e) => setNewContract({ ...newContract, value: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Status Inicial</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
                                        value={newContract.status}
                                        onChange={(e) => setNewContract({ ...newContract, status: e.target.value as any })}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="pending">Pendente</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleAddContract}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[25px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={24} />
                                Finalizar Cadastro do Contrato
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewItem && (
                <ContractPreviewModal
                    contract={previewItem.contract}
                    client={previewItem.client}
                    onClose={() => setPreviewItem(null)}
                />
            )}
        </div>
    );
};
