import React from 'react';
import { Contract, ClientData } from '../types';
import { X, Download, Printer, FileCheck, Shield } from 'lucide-react';
import { formatDateBR, formatCurrencyBR } from '../utils/formatters';

interface ContractPreviewModalProps {
    contract: Contract;
    client: ClientData;
    onClose: () => void;
}

export const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({ contract, client, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static">
            <div className="bg-white w-full max-w-4xl h-full max-h-[95vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-scaleIn print:shadow-none print:rounded-none print:max-h-none print:h-auto overflow-y-auto no-scrollbar">

                {/* Header - Hidden on Print */}
                <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 print:hidden backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Visualização do Contrato</h2>
                        <p className="text-xs text-slate-500 font-medium">Documento gerado eletronicamente pelo NexusHub</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                        >
                            <Printer size={18} /> Imprimir / PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Contract Paper */}
                <div className="flex-1 bg-slate-100 p-4 md:p-12 print:p-0 print:bg-white overflow-y-auto no-scrollbar">
                    <div className="bg-white mx-auto w-full max-w-[210mm] min-h-[297mm] shadow-xl p-[20mm] md:p-[30mm] text-slate-800 font-serif leading-relaxed print:shadow-none print:p-0">

                        {/* Letterhead */}
                        <div className="flex justify-between items-start mb-16 border-b-2 border-slate-900 pb-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-indigo-600 mb-4 print:text-black">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center print:bg-black">
                                        <Shield size={24} className="text-white" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter text-slate-900">NexusHub</span>
                                </div>
                                <p className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest">Agência Digital & Software House</p>
                            </div>
                            <div className="text-right font-sans">
                                <p className="text-xs font-bold text-slate-900">ID DO DOCUMENTO</p>
                                <p className="text-sm font-mono text-slate-500">#{contract.id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-16">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-4">Instrumento Particular de Contratação</h1>
                            <div className="w-24 h-1 bg-slate-900 mx-auto"></div>
                        </div>

                        {/* Parties */}
                        <section className="mb-10 space-y-4">
                            <h3 className="font-sans font-bold text-lg border-b border-slate-200 pb-2 mb-4">1. DAS PARTES</h3>
                            <p>
                                <strong>CONTRATADA:</strong> NexusHub Digital, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 00.000.000/0001-00, com sede administrativa em São Bernardo do Campo - SP.
                            </p>
                            <p>
                                <strong>CONTRATANTE:</strong> <strong>{client.company}</strong>, pessoa jurídica inscrita sob o endereço
                                {client.address ? ` ${client.address.street}, ${client.address.number}, ${client.address.city}/${client.address.state}` : ' [Consultar Cadastro de Endereço]'},
                                representada neste ato por {client.responsiblePerson || client.name}.
                            </p>
                        </section>

                        {/* Object */}
                        <section className="mb-10 space-y-4">
                            <h3 className="font-sans font-bold text-lg border-b border-slate-200 pb-2 mb-4">2. DO OBJETO</h3>
                            <p>
                                O presente contrato tem por objeto a prestação de serviços de: <strong>{contract.title}</strong>, contemplando o desenvolvimento, manutenção e suporte técnico conforme pacotes ativos no painel administrativo NexusHub.
                            </p>
                        </section>

                        {/* Value and Payment */}
                        <section className="mb-10 space-y-4">
                            <h3 className="font-sans font-bold text-lg border-b border-slate-200 pb-2 mb-4">3. DOS VALORES E VIGÊNCIA</h3>
                            <p>
                                Pela prestação dos serviços ora contratados, a CONTRATANTE pagará à CONTRATADA o valor total de <strong>{formatCurrencyBR(contract.value)}</strong>,
                                com vigência estabelecida entre as datas de <strong>{formatDateBR(contract.startDate)}</strong> e <strong>{formatDateBR(contract.endDate)}</strong>.
                            </p>
                            <p>
                                O pagamento será realizado conforme as faturas emitidas mensalmente via portal NexusHub, com vencimento pactuado entre as partes.
                            </p>
                        </section>

                        {/* Obligations */}
                        <section className="mb-10 space-y-4">
                            <h3 className="font-sans font-bold text-lg border-b border-slate-200 pb-2 mb-4">4. DAS OBRIGAÇÕES</h3>
                            <p>
                                A CONTRATADA compromete-se a entregar os serviços com alto padrão de qualidade e disponibilidade, garantindo o sigilo dos dados conforme a LGPD.
                                A CONTRATANTE compromete-se a fornecer todos os acessos e informações necessárias para o pleno desenvolvimento dos trabalhos.
                            </p>
                        </section>

                        {/* Signatures */}
                        <div className="mt-40 grid grid-cols-2 gap-[20mm]">
                            <div className="text-center space-y-2">
                                <div className="border-t-2 border-slate-900 pt-4">
                                    <p className="font-bold">NexusHub Digital</p>
                                    <p className="text-xs text-slate-500">CONTRATADA</p>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="border-t-2 border-slate-900 pt-4">
                                    <p className="font-bold">{client.company}</p>
                                    <p className="text-xs text-slate-500">CONTRATANTE</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-20 pt-10 border-t border-slate-100 text-[9px] text-slate-400 font-sans text-center">
                            <p>Este documento possui validade jurídica mediante assinatura digital ou aceite eletrônico no Portal do Cliente.</p>
                            <p>Gerado em {new Date().toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
