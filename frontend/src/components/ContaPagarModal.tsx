import { useState, useEffect } from "react";
import { X, Save, DollarSign, Calendar, Tag, FileText, Repeat, CreditCard } from "lucide-react";
import type { ContaPagar } from "../types";

interface ContaPagarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ContaPagar>) => Promise<void>;
    conta?: ContaPagar | null;
}

export default function ContaPagarModal({
    isOpen,
    onClose,
    onSave,
    conta,
}: ContaPagarModalProps) {
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [dataVencimento, setDataVencimento] = useState("");
    const [categoria, setCategoria] = useState("");
    const [fornecedorNome, setFornecedorNome] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [parcelado, setParcelado] = useState(false);
    const [numeroParcelas, setNumeroParcelas] = useState("1");
    const [recorrente, setRecorrente] = useState(false);
    const [diaVencimentoRecorrente, setDiaVencimentoRecorrente] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (conta) {
                setDescricao(conta.descricao || "");
                setValor(conta.valor.toString());
                setDataVencimento(conta.data_vencimento.split("T")[0]);
                setCategoria(conta.categoria || "");
                setFornecedorNome(conta.fornecedor_nome || "");
                setObservacoes(conta.observacoes || "");
                setParcelado(!!conta.parcela_total && conta.parcela_total > 1);
                setNumeroParcelas(conta.parcela_total?.toString() || "1");
                setRecorrente(conta.recorrente || false);
                setDiaVencimentoRecorrente(conta.dia_vencimento_recorrente?.toString() || "");
            } else {
                resetForm();
            }
        }
    }, [isOpen, conta]);

    const resetForm = () => {
        setDescricao("");
        setValor("");
        setDataVencimento("");
        setCategoria("");
        setFornecedorNome("");
        setObservacoes("");
        setParcelado(false);
        setNumeroParcelas("1");
        setRecorrente(false);
        setDiaVencimentoRecorrente("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data: Partial<ContaPagar> = {
                descricao,
                valor: parseFloat(valor),
                data_vencimento: dataVencimento,
                categoria: categoria || null,
                fornecedor_nome: fornecedorNome || null,
                observacoes: observacoes || null,
                recorrente,
                dia_vencimento_recorrente: recorrente && diaVencimentoRecorrente ? parseInt(diaVencimentoRecorrente) : null,
                parcela_total: parcelado ? parseInt(numeroParcelas) : null,
            };

            if (conta) {
                data.id = conta.id;
            }

            await onSave(data);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar conta:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CreditCard className="text-red-400" size={28} />
                        {conta ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Descrição *
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    required
                                    placeholder="Ex: Aluguel do galpão"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Valor e Data de Vencimento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Valor *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={valor}
                                        onChange={(e) => setValor(e.target.value)}
                                        required
                                        placeholder="0,00"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Data de Vencimento *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="date"
                                        value={dataVencimento}
                                        onChange={(e) => setDataVencimento(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Categoria e Fornecedor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Categoria
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        placeholder="Ex: Veículo, Aluguel, Manutenção"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Fornecedor
                                </label>
                                <input
                                    type="text"
                                    value={fornecedorNome}
                                    onChange={(e) => setFornecedorNome(e.target.value)}
                                    placeholder="Nome do fornecedor"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Observações */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Observações
                            </label>
                            <textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                rows={3}
                                placeholder="Informações adicionais..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        {/* Opções de Parcelamento e Recorrência */}
                        {!conta && (
                            <div className="border-t border-slate-700/50 pt-6 space-y-4">
                                {/* Parcelamento */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="parcelado"
                                        checked={parcelado}
                                        onChange={(e) => setParcelado(e.target.checked)}
                                        className="mt-1 w-4 h-4 bg-slate-800 border-slate-600 rounded focus:ring-red-500"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="parcelado" className="block text-sm font-medium text-slate-300 mb-2">
                                            Parcelar pagamento
                                        </label>
                                        {parcelado && (
                                            <div className="mt-2">
                                                <label className="block text-xs text-slate-400 mb-1">
                                                    Número de parcelas
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2"
                                                    max="120"
                                                    value={numeroParcelas}
                                                    onChange={(e) => setNumeroParcelas(e.target.value)}
                                                    className="w-32 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Serão criadas {numeroParcelas} contas com vencimentos mensais
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recorrência */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="recorrente"
                                        checked={recorrente}
                                        onChange={(e) => setRecorrente(e.target.checked)}
                                        className="mt-1 w-4 h-4 bg-slate-800 border-slate-600 rounded focus:ring-red-500"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="recorrente" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                            <Repeat size={16} />
                                            Conta recorrente
                                        </label>
                                        {recorrente && (
                                            <div className="mt-2">
                                                <label className="block text-xs text-slate-400 mb-1">
                                                    Dia do vencimento (1-31)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={diaVencimentoRecorrente}
                                                    onChange={(e) => setDiaVencimentoRecorrente(e.target.value)}
                                                    className="w-32 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Esta conta será gerada automaticamente todo mês
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {isSubmitting ? "Salvando..." : conta ? "Atualizar" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
