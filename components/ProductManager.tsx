import React, { useState } from 'react';
import { ClientData, Product } from '../types';
import {
    Plus, Search, Package, DollarSign,
    Trash2, Check, X, AlertCircle,
    ShoppingBag, Star, TrendingUp, Layers
} from 'lucide-react';
import { formatCurrencyBR } from '../utils/formatters';
import { useToastContext } from '../contexts/ToastContext';

interface ProductManagerProps {
    clients: ClientData[];
    onUpdateClient: (clientId: string, updates: Partial<ClientData>) => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ clients, onUpdateClient }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        active: true
    });
    const toast = useToastContext();

    const allProducts = clients.flatMap(client =>
        (client.products || []).map(product => ({ ...product, clientName: client.name, clientCompany: client.company, clientId: client.id }))
    ).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddProduct = () => {
        if (!selectedClient || !newProduct.name || !newProduct.price) {
            toast.error("Por favor, preencha o nome e o preço.");
            return;
        }

        const client = clients.find(c => c.id === selectedClient);
        if (client) {
            const product: Product = {
                id: Date.now().toString(),
                name: newProduct.name!,
                description: newProduct.description || '',
                price: newProduct.price || 0,
                active: newProduct.active !== undefined ? newProduct.active : true
            };

            const updatedProducts = [...(client.products || []), product];
            onUpdateClient(client.id, { products: updatedProducts });
            toast.success("Produto/Serviço adicionado com sucesso!");
            setIsFormOpen(false);
            setNewProduct({ name: '', description: '', price: 0, active: true });
            setSelectedClient('');
        }
    };

    const handleDeleteProduct = (clientId: string, productId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const updatedProducts = client.products?.filter(p => p.id !== productId) || [];
            onUpdateClient(clientId, { products: updatedProducts });
            toast.success("Produto removido.");
        }
    };

    const toggleProductStatus = (clientId: string, productId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            const updatedProducts = client.products?.map(p =>
                p.id === productId ? { ...p, active: !p.active } : p
            ) || [];
            onUpdateClient(clientId, { products: updatedProducts });
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center text-slate-800">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Produtos & Serviços</h2>
                    <p className="text-slate-500 mt-1">Gerencie o catálogo de soluções entregues aos clientes</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-[20px] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} /> Novo Lançamento
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <ShoppingBag size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ativos</p>
                        <p className="text-2xl font-black text-slate-800">{allProducts.filter(p => p.active).length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita Bruta</p>
                        <p className="text-2xl font-black text-slate-800">{formatCurrencyBR(allProducts.reduce((acc, p) => acc + p.price, 0))}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5 md:col-span-2">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Layers size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribuição</p>
                        <p className="text-sm font-bold text-slate-600">Serviços por Cliente: {(allProducts.length / (clients.length || 1)).toFixed(1)} média</p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome do serviço ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allProducts.length > 0 ? allProducts.map(product => (
                    <div key={product.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${product.active ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Package size={28} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg">{product.name}</h3>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{product.clientCompany}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleProductStatus(product.clientId, product.id)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${product.active
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-slate-50 text-slate-400 border-slate-200'
                                        }`}
                                >
                                    {product.active ? 'Ativo' : 'Inativo'}
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.clientId, product.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[40px] font-medium leading-relaxed">
                            {product.description || 'Nenhuma descrição detalhada fornecida para este serviço.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <TrendingUp size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor do Setup/Mensal</p>
                                    <p className="text-base font-black text-slate-800">{formatCurrencyBR(product.price)}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:underline">
                                Detalhes <X className="rotate-45" size={14} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                        <Package size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">Nenhum produto ou serviço cadastrado</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-scaleIn">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800">Novo Produto / Serviço</h3>
                                <p className="text-sm text-slate-500 font-medium">Lance uma nova solução no portfólio do cliente</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Vincular ao Cliente</label>
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nome da Solução</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Consultoria SEO Avançada"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Descrição</label>
                                <textarea
                                    placeholder="Descreva o escopo do produto ou serviço..."
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Valor Unitário / Mensal</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-8">
                                    <button
                                        onClick={() => setNewProduct({ ...newProduct, active: !newProduct.active })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${newProduct.active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newProduct.active ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Produto Ativo</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAddProduct}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[25px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Check size={24} />
                                Salvar no Catálogo do Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
