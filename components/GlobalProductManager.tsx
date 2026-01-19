import React, { useState } from 'react';
import { GlobalProduct, ContractCycle } from '../types';
import {
    Plus, Search, Package, DollarSign,
    Trash2, Check, X, AlertCircle,
    ShoppingBag, Star, TrendingUp, Layers,
    Clock, RefreshCw
} from 'lucide-react';
import { formatCurrencyBR } from '../utils/formatters';
import { useToastContext } from '../contexts/ToastContext';

interface GlobalProductManagerProps {
    products: GlobalProduct[];
    onSaveProducts: (products: GlobalProduct[]) => void;
}

export const GlobalProductManager: React.FC<GlobalProductManagerProps> = ({ products, onSaveProducts }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newProduct, setNewProduct] = useState<Partial<GlobalProduct>>({
        name: '',
        description: '',
        price: 0,
        cycle: ContractCycle.MONTHLY,
        active: true
    });
    const toast = useToastContext();

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.price) {
            toast.error("Por favor, preencha o nome e o preço.");
            return;
        }

        const product: GlobalProduct = {
            id: Date.now().toString(),
            name: newProduct.name!,
            description: newProduct.description || '',
            price: newProduct.price || 0,
            cycle: newProduct.cycle as ContractCycle || ContractCycle.MONTHLY,
            active: true
        };

        onSaveProducts([...products, product]);
        toast.success("Produto adicionado ao catálogo global!");
        setIsFormOpen(false);
        setNewProduct({ name: '', description: '', price: 0, cycle: ContractCycle.MONTHLY, active: true });
    };

    const handleDeleteProduct = (id: string) => {
        onSaveProducts(products.filter(p => p.id !== id));
        toast.success("Produto removido do catálogo.");
    };

    const toggleStatus = (id: string) => {
        onSaveProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center text-slate-800">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Catálogo de Serviços</h2>
                    <p className="text-slate-500 mt-1">Configure os serviços que sua agência oferece aos clientes</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-[20px] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} /> Novo Serviço Global
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <ShoppingBag size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total no Catálogo</p>
                        <p className="text-2xl font-black text-slate-800">{products.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <RefreshCw size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Serviços Ativos</p>
                        <p className="text-2xl font-black text-slate-800">{products.filter(p => p.active).length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket Médio</p>
                        <p className="text-2xl font-black text-slate-800">
                            {formatCurrencyBR(products.length ? products.reduce((acc, p) => acc + p.price, 0) / products.length : 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar no catálogo global..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                    <div key={product.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${product.active ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Package size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleStatus(product.id)} className={`w-8 h-4 rounded-full relative transition-all ${product.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${product.active ? 'left-4.5' : 'left-0.5'}`}></div>
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 className="font-black text-slate-800 text-lg mb-2">{product.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-3">{product.description}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor do Plano</p>
                                <p className="text-xl font-black text-indigo-600">{formatCurrencyBR(product.price)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recorrência</p>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{product.cycle}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                        <Package size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">Nenhum serviço no catálogo global</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-scaleIn">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800">Novo Serviço Global</h3>
                                <p className="text-sm text-slate-500 font-medium">Cadastre um serviço padrão no catálogo</p>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Plano</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Manutenção SaaS Gold"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição do Escopo</label>
                                <textarea
                                    placeholder="Detalhe o que está incluso..."
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none text-sm"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preço Base (BRL)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-lg"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ciclo de Renovação</label>
                                    <select
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                        value={newProduct.cycle}
                                        onChange={(e) => setNewProduct({ ...newProduct, cycle: e.target.value as ContractCycle })}
                                    >
                                        {Object.values(ContractCycle).map(cycle => (
                                            <option key={cycle} value={cycle}>{cycle}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleAddProduct}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[25px] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Adicionar ao Catálogo Global
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
