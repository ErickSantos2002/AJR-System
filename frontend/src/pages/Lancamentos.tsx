import { useState } from "react";
import { Search, Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Filter, X, ChevronDown, ChevronRight, Edit, ArrowUpDown } from "lucide-react";
import { useLancamentos, useHistoricos, useContasAnaliticas } from "../hooks/useLancamentos";
import { useLancamentosMutations } from "../hooks/useLancamentosMutations";
import LancamentosSkeleton from "../components/LancamentosSkeleton";
import LancamentosError from "../components/LancamentosError";
import LancamentoModal from "../components/LancamentoModal";
import Pagination from "../components/Pagination";
import type { Lancamento } from "../types";
import { showSuccess, showError } from "../lib/toast";

export default function Lancamentos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [lancamentoEditando, setLancamentoEditando] = useState<Lancamento | null>(null);

    // Filtros avançados
    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");
    const [contaFiltro, setContaFiltro] = useState<number | null>(null);
    const [historicoFiltro, setHistoricoFiltro] = useState<number | null>(null);

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(20);

    // Ordenação
    const [ordenacao, setOrdenacao] = useState<"desc" | "asc">("desc"); // desc = mais recente primeiro

    const { data: lancamentos, isLoading, isError, error, refetch } = useLancamentos();
    const { data: historicos = [] } = useHistoricos();
    const { data: contas = [] } = useContasAnaliticas();
    const { criarLancamento, atualizarLancamento, deletarLancamento } = useLancamentosMutations();

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleNovoLancamento = () => {
        setLancamentoEditando(null);
        setIsModalOpen(true);
    };

    const handleEditarLancamento = (lancamento: Lancamento, e: React.MouseEvent) => {
        e.stopPropagation();
        setLancamentoEditando(lancamento);
        setIsModalOpen(true);
    };

    const handleSalvarLancamento = async (dados: any) => {
        try {
            if (lancamentoEditando) {
                await atualizarLancamento.mutateAsync({ id: lancamentoEditando.id, dados });
                showSuccess("Lançamento atualizado com sucesso!");
            } else {
                await criarLancamento.mutateAsync(dados);
                showSuccess("Lançamento criado com sucesso!");
            }
        } catch (error) {
            showError("Erro ao salvar lançamento", error);
            throw error;
        }
    };

    const handleFecharModal = () => {
        setIsModalOpen(false);
        setLancamentoEditando(null);
    };

    const handleExcluirLancamento = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) {
            return;
        }

        try {
            await deletarLancamento.mutateAsync(id);
            showSuccess("Lançamento excluído com sucesso!");
        } catch (error) {
            showError("Erro ao excluir lançamento", error);
        }
    };

    const getContaDescricao = (contaId: number) => {
        const conta = contas.find((c) => c.id === contaId);
        return conta ? `${conta.codigo} - ${conta.descricao}` : "N/A";
    };

    const getHistoricoDescricao = (historicoId: number) => {
        const historico = historicos.find((h) => h.id === historicoId);
        return historico ? historico.descricao : "N/A";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    if (isLoading) return <LancamentosSkeleton />;
    if (isError) return <LancamentosError error={error as Error} onRetry={() => refetch()} />;
    if (!lancamentos) return null;

    const limparFiltros = () => {
        setSearchTerm("");
        setDataInicial("");
        setDataFinal("");
        setContaFiltro(null);
        setHistoricoFiltro(null);
    };

    const filteredLancamentos = lancamentos
        .filter((lancamento) => {
            const historico = getHistoricoDescricao(lancamento.historico_id);

            // Filtro de busca por texto
            const matchesSearch =
                historico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatDate(lancamento.data_lancamento).includes(searchTerm) ||
                lancamento.complemento?.toLowerCase().includes(searchTerm.toLowerCase());

            if (searchTerm && !matchesSearch) return false;

            // Filtro de data inicial
            if (dataInicial && lancamento.data_lancamento < dataInicial) return false;

            // Filtro de data final
            if (dataFinal && lancamento.data_lancamento > dataFinal) return false;

            // Filtro de histórico
            if (historicoFiltro && lancamento.historico_id !== historicoFiltro) return false;

            // Filtro de conta (verifica se alguma partida usa essa conta)
            if (contaFiltro) {
                const temConta = lancamento.partidas.some((p) => p.conta_id === contaFiltro);
                if (!temConta) return false;
            }

            return true;
        })
        .sort((a, b) => {
            // Ordenação por data
            const dateA = new Date(a.data_lancamento).getTime();
            const dateB = new Date(b.data_lancamento).getTime();

            return ordenacao === "desc" ? dateB - dateA : dateA - dateB;
        });

    // Paginação
    const totalPaginas = Math.ceil(filteredLancamentos.length / itensPorPagina);
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = indiceInicio + itensPorPagina;
    const lancamentosPaginados = filteredLancamentos.slice(indiceInicio, indiceFim);

    const mudarItensPorPagina = (novoValor: number) => {
        setItensPorPagina(novoValor);
        setPaginaAtual(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
                            Contabilidade
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-emerald-100 to-green-200 bg-clip-text text-transparent">
                        Lançamentos Contábeis
                    </h1>
                    <p className="text-slate-400">
                        Registro de lançamentos em partidas dobradas
                    </p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Buscar por histórico, data ou observações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <button
                            onClick={() => setOrdenacao(ordenacao === "desc" ? "asc" : "desc")}
                            className="px-4 py-3 rounded-xl transition-all flex items-center font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                            title={ordenacao === "desc" ? "Mais recentes primeiro" : "Mais antigos primeiro"}
                        >
                            <ArrowUpDown size={20} className="mr-2" />
                            {ordenacao === "desc" ? "Mais recentes" : "Mais antigos"}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center font-medium ${
                                showFilters
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            <Filter size={20} className="mr-2" />
                            Filtros
                        </button>
                        <button
                            onClick={handleNovoLancamento}
                            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center font-medium hover:scale-105"
                        >
                            <Plus size={20} className="mr-2" />
                            Novo Lançamento
                        </button>
                    </div>
                </div>

                {/* Filtros Avançados */}
                {showFilters && (
                    <div className="border-t border-slate-700/50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Data Inicial */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Data Inicial
                                </label>
                                <input
                                    type="date"
                                    value={dataInicial}
                                    onChange={(e) => setDataInicial(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Data Final */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Data Final
                                </label>
                                <input
                                    type="date"
                                    value={dataFinal}
                                    onChange={(e) => setDataFinal(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Histórico */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Histórico
                                </label>
                                <select
                                    value={historicoFiltro || ""}
                                    onChange={(e) =>
                                        setHistoricoFiltro(e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    {historicos.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.descricao}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Conta */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Conta
                                </label>
                                <select
                                    value={contaFiltro || ""}
                                    onChange={(e) =>
                                        setContaFiltro(e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="">Todas</option>
                                    {contas.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.codigo} - {c.descricao}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botão Limpar Filtros */}
                        {(dataInicial || dataFinal || historicoFiltro || contaFiltro || searchTerm) && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={limparFiltros}
                                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-all flex items-center text-sm"
                                >
                                    <X size={16} className="mr-2" />
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lancamentos List */}
            <div className="space-y-4">
                {lancamentosPaginados.map((lancamento) => {
                    const totalDebito = lancamento.partidas
                        .filter((p) => p.tipo === "DEBITO")
                        .reduce((sum, p) => sum + Number(p.valor || 0), 0);
                    const totalCredito = lancamento.partidas
                        .filter((p) => p.tipo === "CREDITO")
                        .reduce((sum, p) => sum + Number(p.valor || 0), 0);

                    const isExpanded = expandedIds.has(lancamento.id);

                    return (
                        <div
                            key={lancamento.id}
                            className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
                        >
                            {/* Header do Lançamento - Clicável */}
                            <div
                                onClick={() => toggleExpand(lancamento.id)}
                                className="bg-slate-800/30 px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Ícone Expandir/Colapsar */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpand(lancamento.id);
                                            }}
                                            className="text-slate-400 hover:text-emerald-400 transition-colors"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown size={20} />
                                            ) : (
                                                <ChevronRight size={20} />
                                            )}
                                        </button>
                                        <span className="text-slate-400 text-sm">
                                            #{lancamento.id}
                                        </span>
                                        <span className="text-white font-medium">
                                            {formatDate(lancamento.data_lancamento)}
                                        </span>
                                        <span className="text-slate-300">
                                            {getHistoricoDescricao(lancamento.historico_id)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-400">
                                            Total:{" "}
                                            <span className="text-emerald-400 font-medium">
                                                {formatCurrency(totalDebito)}
                                            </span>
                                        </span>
                                        <button
                                            onClick={(e) => handleEditarLancamento(lancamento, e)}
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleExcluirLancamento(lancamento.id, e)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {lancamento.complemento && (
                                    <p className="text-slate-400 text-sm mt-2 ml-9">
                                        {lancamento.complemento}
                                    </p>
                                )}
                            </div>

                            {/* Partidas - Só mostra quando expandido */}
                            {isExpanded && (
                                <div className="p-6 border-t border-slate-700/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Débitos */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ArrowUpCircle className="text-rose-400" size={20} />
                                            <h3 className="text-sm font-medium text-slate-300">
                                                Débitos
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {lancamento.partidas
                                                .filter((p) => p.tipo === "DEBITO")
                                                .map((partida, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-slate-800/30 rounded-lg p-3 border border-rose-500/20"
                                                    >
                                                        <div className="text-sm text-slate-300 mb-1">
                                                            {getContaDescricao(partida.conta_id)}
                                                        </div>
                                                        <div className="text-rose-400 font-semibold">
                                                            {formatCurrency(partida.valor)}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Total Débitos:</span>
                                                <span className="text-rose-400 font-semibold">
                                                    {formatCurrency(totalDebito)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Créditos */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ArrowDownCircle className="text-emerald-400" size={20} />
                                            <h3 className="text-sm font-medium text-slate-300">
                                                Créditos
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {lancamento.partidas
                                                .filter((p) => p.tipo === "CREDITO")
                                                .map((partida, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-slate-800/30 rounded-lg p-3 border border-emerald-500/20"
                                                    >
                                                        <div className="text-sm text-slate-300 mb-1">
                                                            {getContaDescricao(partida.conta_id)}
                                                        </div>
                                                        <div className="text-emerald-400 font-semibold">
                                                            {formatCurrency(partida.valor)}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Total Créditos:</span>
                                                <span className="text-emerald-400 font-semibold">
                                                    {formatCurrency(totalCredito)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Validação */}
                                {totalDebito === totalCredito && (
                                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                                        <span className="text-emerald-400 text-sm font-medium">
                                            ✓ Partidas balanceadas
                                        </span>
                                    </div>
                                )}
                            </div>
                            )}
                        </div>
                    );
                })}

                {filteredLancamentos.length === 0 && (
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
                        <div className="text-slate-400">Nenhum lançamento encontrado</div>
                    </div>
                )}
            </div>

            {/* Paginação */}
            {filteredLancamentos.length > 0 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={paginaAtual}
                        totalPages={totalPaginas}
                        onPageChange={setPaginaAtual}
                        itemsPerPage={itensPorPagina}
                        totalItems={filteredLancamentos.length}
                        onItemsPerPageChange={mudarItensPorPagina}
                    />
                </div>
            )}

            {/* Modal */}
            <LancamentoModal
                isOpen={isModalOpen}
                onClose={handleFecharModal}
                onSave={handleSalvarLancamento}
                historicos={historicos}
                contas={contas}
                lancamentoInicial={lancamentoEditando}
            />
        </div>
    );
}
