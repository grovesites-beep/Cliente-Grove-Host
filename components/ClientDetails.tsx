import React, { useState } from 'react';
import { ClientData, Product, Contract, PasswordVaultItem } from '../types';
import {
    X, User, Mail, Phone, MapPin, Globe, Calendar, Lock, FileText,
    Package, CreditCard, Key, Edit, Trash2, Plus, Eye, EyeOff, Copy,
    Check, Building2, UserCircle, StickyNote, Settings2
} from 'lucide-react';
import { formatPhoneBR, formatDateBR, formatCurrencyBR, formatCEP } from '../utils/formatters';

interface ClientDetailsProps {
    client: ClientData;
    onClose: () => void;
    onUpdate: (client: ClientData) => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'products' | 'contracts' | 'vault' | 'integrations' | 'notes'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [configuringIntegration, setConfiguringIntegration] = useState<any>(null);
    const [configData, setConfigData] = useState<{ [key: string]: string }>({});

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-slideIn">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            {client.avatar ? (
                                <img src={client.avatar} alt={client.name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-4 border-white shadow-lg">
                                    {client.name.charAt(0)}{client.company.charAt(0)}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>

                        {/* Client Info */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{client.name}</h2>
                            <p className="text-slate-500 flex items-center gap-2 mt-1">
                                <Building2 size={14} />
                                {client.company}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                        >
                            <Edit size={16} />
                            {isEditing ? 'Cancelar' : 'Editar'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-8 py-4 border-b border-slate-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'info' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <User size={16} className="inline mr-2" />
                        Informações Gerais
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Package size={16} className="inline mr-2" />
                        Produtos ({client.products?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('contracts')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'contracts' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <FileText size={16} className="inline mr-2" />
                        Contratos ({client.contracts?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('vault')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'vault' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Key size={16} className="inline mr-2" />
                        Cofre de Senhas ({client.passwordVault?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'integrations' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Settings2 size={16} className="inline mr-2" />
                        Integrações ({client.integrations?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <StickyNote size={16} className="inline mr-2" />
                        Notas
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Mail size={16} className="text-indigo-600" />
                                    Informações de Contato
                                </h3>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Nome Completo</label>
                                        <p className="text-slate-800 font-medium">{client.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Email</label>
                                        <p className="text-slate-800 font-medium">{client.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Telefone</label>
                                        <p className="text-slate-800 font-medium">{client.phone ? formatPhoneBR(client.phone) : 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Responsável</label>
                                        <p className="text-slate-800 font-medium">{client.responsiblePerson || 'Não informado'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={16} className="text-indigo-600" />
                                    Endereço
                                </h3>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                    {client.address ? (
                                        <>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium">Rua</label>
                                                <p className="text-slate-800 font-medium">{client.address.street}, {client.address.number}</p>
                                            </div>
                                            {client.address.complement && (
                                                <div>
                                                    <label className="text-xs text-slate-500 font-medium">Complemento</label>
                                                    <p className="text-slate-800 font-medium">{client.address.complement}</p>
                                                </div>
                                            )}
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium">Bairro</label>
                                                <p className="text-slate-800 font-medium">{client.address.neighborhood}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium">Cidade/Estado</label>
                                                <p className="text-slate-800 font-medium">{client.address.city}, {client.address.state}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-medium">CEP</label>
                                                <p className="text-slate-800 font-medium">{formatCEP(client.address.zipCode)}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-slate-500 text-sm">Endereço não cadastrado</p>
                                    )}
                                </div>
                            </div>

                            {/* Website Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Globe size={16} className="text-indigo-600" />
                                    Informações do Site
                                </h3>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Domínio</label>
                                        <p className="text-slate-800 font-medium">{client.siteUrl}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Tipo de Site</label>
                                        <p className="text-slate-800 font-medium">{client.siteType}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Vencimento Hospedagem</label>
                                        <p className="text-slate-800 font-medium">{formatDateBR(client.hostingExpiry)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Status</label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${client.maintenanceMode ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {client.maintenanceMode ? 'Em Manutenção' : 'Ativo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Access */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <Lock size={16} className="text-indigo-600" />
                                    Acesso ao Portal
                                </h3>

                                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Email de Login</label>
                                        <p className="text-slate-800 font-medium">{client.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-medium">Senha</label>
                                        <div className="flex items-center gap-2">
                                            <p className="text-slate-800 font-medium">
                                                {showPassword['portal'] ? client.password || '••••••••' : '••••••••'}
                                            </p>
                                            <button
                                                onClick={() => setShowPassword({ ...showPassword, portal: !showPassword['portal'] })}
                                                className="p-1 hover:bg-slate-200 rounded"
                                            >
                                                {showPassword['portal'] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Produtos Contratados</h3>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                                    <Plus size={16} />
                                    Adicionar Produto
                                </button>
                            </div>

                            {client.products && client.products.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {client.products.map((product) => (
                                        <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-slate-800">{product.name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {product.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                                            <p className="text-lg font-bold text-indigo-600">{formatCurrencyBR(product.price)}/mês</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-xl">
                                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Nenhum produto contratado</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'contracts' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Contratos</h3>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                                    <Plus size={16} />
                                    Novo Contrato
                                </button>
                            </div>

                            {client.contracts && client.contracts.length > 0 ? (
                                <div className="space-y-3">
                                    {client.contracts.map((contract) => (
                                        <div key={contract.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 mb-2">{contract.title}</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <label className="text-xs text-slate-500">Início</label>
                                                            <p className="font-medium">{formatDateBR(contract.startDate)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500">Término</label>
                                                            <p className="font-medium">{formatDateBR(contract.endDate)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500">Valor</label>
                                                            <p className="font-medium text-indigo-600">{formatCurrencyBR(contract.value)}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500">Status</label>
                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(contract.status)}`}>
                                                                {contract.status === 'active' ? 'Ativo' : contract.status === 'expired' ? 'Expirado' : 'Pendente'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="ml-4 p-2 hover:bg-slate-100 rounded-lg">
                                                    <FileText size={18} className="text-slate-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-xl">
                                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Nenhum contrato cadastrado</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'vault' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Cofre de Senhas</h3>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                                    <Plus size={16} />
                                    Nova Senha
                                </button>
                            </div>

                            {client.passwordVault && client.passwordVault.length > 0 ? (
                                <div className="space-y-3">
                                    {client.passwordVault.map((item) => (
                                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 mb-2">{item.service}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <label className="text-xs text-slate-500">Usuário</label>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">{item.username}</p>
                                                                <button
                                                                    onClick={() => copyToClipboard(item.username, `user-${item.id}`)}
                                                                    className="p-1 hover:bg-slate-100 rounded"
                                                                >
                                                                    {copiedId === `user-${item.id}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500">Senha</label>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium font-mono">
                                                                    {showPassword[item.id] ? item.password : '••••••••'}
                                                                </p>
                                                                <button
                                                                    onClick={() => setShowPassword({ ...showPassword, [item.id]: !showPassword[item.id] })}
                                                                    className="p-1 hover:bg-slate-100 rounded"
                                                                >
                                                                    {showPassword[item.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => copyToClipboard(item.password, `pass-${item.id}`)}
                                                                    className="p-1 hover:bg-slate-100 rounded"
                                                                >
                                                                    {copiedId === `pass-${item.id}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {item.url && (
                                                            <div>
                                                                <label className="text-xs text-slate-500">URL</label>
                                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">
                                                                    Acessar
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {item.notes && (
                                                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded">{item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-xl">
                                    <Key size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Nenhuma senha cadastrada</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Integrações de Dados</h3>
                                <p className="text-sm text-slate-500">Configure as fontes de dados para este cliente</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {client.integrations && client.integrations.map((integration) => (
                                    <div key={integration.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 p-2">
                                                    <img src={integration.icon} alt={integration.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{integration.name}</h4>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // In a real app, this would open a specific config modal
                                                    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
                                                    const updatedIntegrations = client.integrations.map(i =>
                                                        i.id === integration.id ? { ...i, status: newStatus as any, lastSync: new Date().toISOString() } : i
                                                    );
                                                    onUpdate({ ...client, integrations: updatedIntegrations });
                                                }}
                                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${integration.status === 'connected'
                                                    ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                            >
                                                {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>Última sincronização: {integration.lastSync ? formatDateBR(integration.lastSync) : 'Nunca'}</span>
                                            <button
                                                onClick={() => {
                                                    setConfiguringIntegration(integration);
                                                    setConfigData({});
                                                }}
                                                className="text-indigo-600 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Configurar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 mb-2">Dica de Especialista</h4>
                                <p className="text-sm text-indigo-700 leading-relaxed">
                                    Conecte o WordPress e o Google Analytics para habilitar o relatório automático de performance e o co-piloto de IA.
                                </p>
                            </div>

                            {/* Integration Config Modal */}
                            {configuringIntegration && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[1001] p-4 animate-fadeIn">
                                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slideIn overflow-hidden">
                                        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/20 p-2">
                                                    <img src={configuringIntegration.icon} alt="" className="w-full h-full object-contain brightness-0 invert" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">Configurar {configuringIntegration.name}</h4>
                                                    <p className="text-xs text-white/70">Ajuste as chaves de conexão</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setConfiguringIntegration(null)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            {configuringIntegration.name === 'WordPress' ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase">URL do JSON API</label>
                                                        <input
                                                            type="text"
                                                            className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            placeholder="https://site.com/wp-json"
                                                            value={configData.wpUrl || ''}
                                                            onChange={(e) => setConfigData({ ...configData, wpUrl: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase">Application Password</label>
                                                        <input
                                                            type="password"
                                                            className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            placeholder="xxxx xxxx xxxx xxxx"
                                                            value={configData.wpPass || ''}
                                                            onChange={(e) => setConfigData({ ...configData, wpPass: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 uppercase">Measurement ID (G-XXXXX)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            placeholder="G-12345678"
                                                            value={configData.gaId || ''}
                                                            onChange={(e) => setConfigData({ ...configData, gaId: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => {
                                                    // In a real app, update the integration object with configData
                                                    const updatedIntegrations = client.integrations.map(i =>
                                                        i.id === configuringIntegration.id ? { ...i, status: 'connected' as any, lastSync: new Date().toISOString() } : i
                                                    );
                                                    onUpdate({ ...client, integrations: updatedIntegrations });
                                                    setConfiguringIntegration(null);
                                                }}
                                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                                            >
                                                Salvar e Testar Conexão
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Notas e Observações</h3>
                            <div className="bg-slate-50 rounded-xl p-6">
                                {isEditing ? (
                                    <textarea
                                        className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        placeholder="Adicione notas sobre este cliente..."
                                        defaultValue={client.notes}
                                    />
                                ) : (
                                    <div className="prose max-w-none">
                                        {client.notes ? (
                                            <p className="text-slate-700 whitespace-pre-wrap">{client.notes}</p>
                                        ) : (
                                            <p className="text-slate-500 italic">Nenhuma nota cadastrada</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isEditing && (
                    <div className="px-8 py-4 border-t border-slate-200 flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                // Save changes
                                setIsEditing(false);
                            }}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
