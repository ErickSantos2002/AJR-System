import { X, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";
import { useSaldoConta, useMovimentacoesConta } from "../hooks/usePlanoContasDetalhes";
import type { PlanoContas } from "../types";

interface PlanoContasDetalhesModalProps {
    conta: PlanoContas | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PlanoContasDetalhesModal({
    conta,
    isOpen,
    onClose,
}: PlanoContasDetalhesModalProps) {
    const { data: saldo, isLoading: loadingSaldo } = useSaldoConta(conta?.id || null);
    const { data: movimentacoes, isLoading: loadingMovimentacoes } = useMovimentacoesConta(
        conta?.id || null,
        10
    );

    if (!isOpen || !conta) return null;

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(valor);
    };

    const formatarData = (dataISO: string) => {
        return new Date(dataISO).toLocaleDateString("pt-BR");
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            Detalhes da Conta
                        </h2>
                        <p className="text-sm text-slate-400">
                            {conta.codigo} - {conta.descricao}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Informações da Conta */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-3">Informações</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-slate-400">Código:</span>
                                <p className="text-white font-mono">{conta.codigo}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-400">Tipo:</span>
                                <p className="text-white">{conta.tipo}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-400">Natureza:</span>
                                <p className="text-white">{conta.natureza}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-400">Nível:</span>
                                <p className="text-white">{conta.nivel}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-400">Aceita Lançamento:</span>
                                <p className="text-white">
                                    {conta.aceita_lancamento ? "Sim" : "Não"}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-400">Status:</span>
                                <p className="text-white">{conta.ativo ? "Ativo" : "Inativo"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Saldo */}
                    {loadingSaldo ? (
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <div className="animate-pulse space-y-3">
                                <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
                                <div className="h-10 bg-slate-700/50 rounded w-1/2"></div>
                            </div>
                        </div>
                    ) : saldo ? (
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/30">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Saldo Atual
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingUp className="text-emerald-400" size={20} />
                                        <span className="text-sm text-slate-400">Débitos</span>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {formatarMoeda(saldo.debitos)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingDown className="text-rose-400" size={20} />
                                        <span className="text-sm text-slate-400">Créditos</span>
                                    </div>
                                    <p className="text-2xl font-bold text-rose-400">
                                        {formatarMoeda(saldo.creditos)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className="text-sm text-slate-400">Saldo</span>
                                    </div>
                                    <p
                                        className={`text-2xl font-bold ${
                                            saldo.saldo >= 0
                                                ? "text-indigo-400"
                                                : "text-orange-400"
                                        }`}
                                    >
                                        {formatarMoeda(saldo.saldo)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Últimas Movimentações */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Últimas Movimentações
                        </h3>

                        {loadingMovimentacoes ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex gap-4">
                                        <div className="h-12 bg-slate-700/50 rounded flex-1"></div>
                                    </div>
                                ))}
                            </div>
                        ) : movimentacoes && movimentacoes.movimentacoes.length > 0 ? (
                            <div className="space-y-2">
                                {movimentacoes.movimentacoes.map((mov) => (
                                    <div
                                        key={mov.id}
                                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    mov.tipo === "DEBITO"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-rose-500/20 text-rose-400"
                                                }`}
                                            >
                                                {mov.tipo === "DEBITO" ? (
                                                    <TrendingUp size={16} />
                                                ) : (
                                                    <TrendingDown size={16} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={14} className="text-slate-500" />
                                                    <span className="text-sm text-slate-400">
                                                        {formatarData(mov.data)}
                                                    </span>
                                                    <FileText size={14} className="text-slate-500" />
                                                    <span className="text-sm text-slate-400">
                                                        Histórico #{mov.historico_id}
                                                    </span>
                                                </div>
                                                {mov.complemento && (
                                                    <p className="text-sm text-slate-300">
                                                        {mov.complemento}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`font-semibold ${
                                                    mov.tipo === "DEBITO"
                                                        ? "text-emerald-400"
                                                        : "text-rose-400"
                                                }`}
                                            >
                                                {mov.tipo === "DEBITO" ? "+" : "-"}
                                                {formatarMoeda(mov.valor)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Lanç. #{mov.lancamento_id}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                                <p>Nenhuma movimentação encontrada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
