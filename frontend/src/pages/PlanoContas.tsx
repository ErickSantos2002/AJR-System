import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Filter, X, FileDown, FileSpreadsheet, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Eye, List, CheckCircle2, XCircle, FileCheck } from "lucide-react";
import { usePlanoContas } from "../hooks/usePlanoContas";
import { usePlanoContasMutations } from "../hooks/usePlanoContasMutations";
import PlanoContasSkeleton from "../components/PlanoContasSkeleton";
import PlanoContasError from "../components/PlanoContasError";
import PlanoContasModal from "../components/PlanoContasModal";
import PlanoContasDetalhesModal from "../components/PlanoContasDetalhesModal";
import SaldoContaCell from "../components/SaldoContaCell";
import Pagination from "../components/Pagination";
import { exportPlanoContasToExcel, exportPlanoContasToPDF } from "../lib/exportPlanoContas";
import { showSuccess, showError } from "../lib/toast";
import type { PlanoContas } from "../types";
import toast from "react-hot-toast";

export default function PlanoContasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contaEditando, setContaEditando] = useState<PlanoContas | null>(null);
    const [contaDetalhes, setContaDetalhes] = useState<PlanoContas | null>(null);
    const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);

    // Filtros
    const [filtroTipo, setFiltroTipo] = useState<string>("");
    const [filtroNatureza, setFiltroNatureza] = useState<string>("");
    const [filtroAceitaLancamento, setFiltroAceitaLancamento] = useState<string>("");
    const [filtroAtivo, setFiltroAtivo] = useState<string>("true");
    const [filtroNivel, setFiltroNivel] = useState<string>("");

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(50);

    // Tree view - Estado de expansão
    const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
        // Carregar do localStorage
        const saved = localStorage.getItem("planoContas_expanded");
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch {
                return new Set();
            }
        }
        return new Set();
    });

    const { data: contas, isLoading, isError, error, refetch } = usePlanoContas();
    const { criarConta, atualizarConta, deletarConta, toggleAtivoConta } = usePlanoContasMutations();

    // Salvar estado de expansão no localStorage
    useEffect(() => {
        localStorage.setItem("planoContas_expanded", JSON.stringify([...expandedIds]));
    }, [expandedIds]);

    // Funções de expand/collapse
    const toggleExpand = (id: number) => {
        setExpandedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const expandirTudo = () => {
        if (!contas) return;
        const allIds = contas.map((c) => c.id);
        setExpandedIds(new Set(allIds));
    };

    const colapsarTudo = () => {
        setExpandedIds(new Set());
    };

    // Verificar se uma conta tem filhas
    const temFilhas = (contaId: number): boolean => {
        if (!contas) return false;
        return contas.some((c) => c.conta_pai_id === contaId);
    };

    // Verificar se uma conta deve ser visível (baseado no estado de expansão dos pais)
    const isContaVisivel = (conta: PlanoContas): boolean => {
        if (!conta.conta_pai_id) return true; // Conta raiz sempre visível

        // Verificar se todos os pais estão expandidos
        let contaAtual = conta;
        while (contaAtual.conta_pai_id) {
            const pai = contas?.find((c) => c.id === contaAtual.conta_pai_id);
            if (!pai) break;

            if (!expandedIds.has(pai.id)) {
                return false; // Pai está colapsado
            }

            contaAtual = pai;
        }

        return true;
    };

    const handleNovaConta = () => {
        setContaEditando(null);
        setIsModalOpen(true);
    };

    const handleEditarConta = (conta: PlanoContas) => {
        setContaEditando(conta);
        setIsModalOpen(true);
    };

    const handleVerDetalhes = (conta: PlanoContas) => {
        setContaDetalhes(conta);
        setIsDetalhesModalOpen(true);
    };

    const handleExcluirConta = async (conta: PlanoContas, e: React.MouseEvent) => {
        e.stopPropagation(); // Evitar abrir modal de detalhes

        if (
            !window.confirm(
                `Tem certeza que deseja excluir a conta "${conta.codigo} - ${conta.descricao}"?\n\nIsso irá desativá-la no sistema.`
            )
        ) {
            return;
        }

        try {
            await deletarConta.mutateAsync(conta.id);
            showSuccess("Conta excluída com sucesso!");
        } catch (error) {
            showError("Erro ao excluir conta. Verifique se não existem lançamentos associados.", error);
        }
    };

    const handleSalvarConta = async (dados: Partial<PlanoContas>) => {
        try {
            if (contaEditando) {
                // Editar conta existente - apenas descricao, aceita_lancamento e ativo
                await atualizarConta.mutateAsync({
                    id: contaEditando.id,
                    dados: {
                        descricao: dados.descricao,
                        aceita_lancamento: dados.aceita_lancamento,
                        ativo: dados.ativo,
                    },
                });
                showSuccess("Conta atualizada com sucesso!");
            } else {
                // Criar nova conta
                await criarConta.mutateAsync(dados);
                showSuccess("Conta criada com sucesso!");
            }
            setIsModalOpen(false);
        } catch (error: any) {
            const mensagem = error.response?.data?.detail || "Erro ao salvar conta";
            showError(mensagem, error);
            throw error;
        }
    };

    const handleToggleAtivo = async (conta: PlanoContas, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await toggleAtivoConta.mutateAsync({
                id: conta.id,
                ativo: !conta.ativo,
            });
            toast.success(
                `Conta ${!conta.ativo ? "ativada" : "desativada"} com sucesso!`
            );
        } catch (error) {
            toast.error("Erro ao atualizar status da conta");
            console.error(error);
        }
    };

    const limparFiltros = () => {
        setSearchTerm("");
        setFiltroTipo("");
        setFiltroNatureza("");
        setFiltroAceitaLancamento("");
        setFiltroAtivo("true");
        setFiltroNivel("");
    };

    if (isLoading) return <PlanoContasSkeleton />;
    if (isError) return <PlanoContasError error={error as Error} onRetry={() => refetch()} />;
    if (!contas) return null;

    // Estatísticas
    const totalContas = contas.length;
    const contasAtivas = contas.filter((c) => c.ativo).length;
    const contasInativas = contas.filter((c) => !c.ativo).length;
    const contasAceitamLancamento = contas.filter((c) => c.aceita_lancamento).length;

    const filteredContas = contas.filter((conta) => {
        // Filtro de busca
        const matchSearch =
            !searchTerm ||
            conta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conta.descricao.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro de tipo
        const matchTipo = !filtroTipo || conta.tipo === filtroTipo;

        // Filtro de natureza
        const matchNatureza = !filtroNatureza || conta.natureza === filtroNatureza;

        // Filtro de aceita lançamento
        const matchAceitaLancamento =
            !filtroAceitaLancamento ||
            conta.aceita_lancamento === (filtroAceitaLancamento === "true");

        // Filtro de ativo
        const matchAtivo =
            !filtroAtivo || conta.ativo === (filtroAtivo === "true");

        // Filtro de nível
        const matchNivel = !filtroNivel || conta.nivel === parseInt(filtroNivel);

        // Filtro de visibilidade (tree view)
        const isVisible = isContaVisivel(conta);

        return (
            matchSearch &&
            matchTipo &&
            matchNatureza &&
            matchAceitaLancamento &&
            matchAtivo &&
            matchNivel &&
            isVisible
        );
    });

    // Paginação
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = indiceInicio + itensPorPagina;
    const contasPaginadas = filteredContas.slice(indiceInicio, indiceFim);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-indigo-400 text-sm font-medium px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm">
                            Contabilidade
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                        Plano de Contas
                    </h1>
                    <p className="text-slate-400">
                        Estrutura hierárquica de contas contábeis
                    </p>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total de Contas</p>
                            <p className="text-3xl font-bold text-white">{totalContas}</p>
                        </div>
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <List className="text-indigo-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Contas Ativas</p>
                            <p className="text-3xl font-bold text-white">{contasAtivas}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <CheckCircle2 className="text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Contas Inativas</p>
                            <p className="text-3xl font-bold text-white">{contasInativas}</p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <XCircle className="text-red-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Aceita Lançamento</p>
                            <p className="text-3xl font-bold text-white">{contasAceitamLancamento}</p>
                        </div>
                        <div className="p-3 bg-cyan-500/20 rounded-xl">
                            <FileCheck className="text-cyan-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar + Actions */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Buscar por código ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={expandirTudo}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-all"
                            title="Expandir Tudo"
                        >
                            <ChevronsDownUp size={18} />
                            Expandir
                        </button>
                        <button
                            onClick={colapsarTudo}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-all"
                            title="Colapsar Tudo"
                        >
                            <ChevronsUpDown size={18} />
                            Colapsar
                        </button>
                        <div className="w-px h-8 bg-slate-600"></div>
                        <button
                            onClick={() => exportPlanoContasToExcel(filteredContas)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all hover:scale-105"
                            title="Exportar para Excel"
                        >
                            <FileSpreadsheet size={18} />
                            Excel
                        </button>
                        <button
                            onClick={() => exportPlanoContasToPDF(filteredContas)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-all hover:scale-105"
                            title="Exportar para PDF"
                        >
                            <FileDown size={18} />
                            PDF
                        </button>
                        <button
                            onClick={handleNovaConta}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:scale-105"
                        >
                            <Plus size={20} />
                            Nova Conta
                        </button>
                    </div>
                </div>

                {/* Filtros Avançados */}
                <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">Filtros</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Filtro Tipo */}
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Todos os Tipos</option>
                            <option value="ATIVO">ATIVO</option>
                            <option value="PASSIVO">PASSIVO</option>
                            <option value="PATRIMONIO_LIQUIDO">PATRIMÔNIO LÍQUIDO</option>
                            <option value="RECEITA">RECEITA</option>
                            <option value="DESPESA">DESPESA</option>
                        </select>

                        {/* Filtro Natureza */}
                        <select
                            value={filtroNatureza}
                            onChange={(e) => setFiltroNatureza(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Todas Naturezas</option>
                            <option value="DEVEDORA">DEVEDORA</option>
                            <option value="CREDORA">CREDORA</option>
                        </select>

                        {/* Filtro Aceita Lançamento */}
                        <select
                            value={filtroAceitaLancamento}
                            onChange={(e) => setFiltroAceitaLancamento(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Todas (Lançamento)</option>
                            <option value="true">Aceita Lançamento</option>
                            <option value="false">Não Aceita</option>
                        </select>

                        {/* Filtro Ativo */}
                        <select
                            value={filtroAtivo}
                            onChange={(e) => setFiltroAtivo(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Todos (Ativo/Inativo)</option>
                            <option value="true">Apenas Ativos</option>
                            <option value="false">Apenas Inativos</option>
                        </select>

                        {/* Filtro Nível */}
                        <select
                            value={filtroNivel}
                            onChange={(e) => setFiltroNivel(e.target.value)}
                            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Todos os Níveis</option>
                            <option value="1">Nível 1</option>
                            <option value="2">Nível 2</option>
                            <option value="3">Nível 3</option>
                            <option value="4">Nível 4</option>
                            <option value="5">Nível 5</option>
                        </select>
                    </div>

                    {/* Botão Limpar Filtros */}
                    {(filtroTipo || filtroNatureza || filtroAceitaLancamento || filtroAtivo !== "true" || filtroNivel || searchTerm) && (
                        <button
                            onClick={limparFiltros}
                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors"
                        >
                            <X size={14} />
                            Limpar Filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Descrição
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Natureza
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                                    Aceita Lançamento
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Saldo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {contasPaginadas.map((conta) => (
                                <tr
                                    key={conta.id}
                                    onClick={() => handleVerDetalhes(conta)}
                                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono text-cyan-400">
                                            {conta.codigo}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className={`flex items-center gap-2 text-sm ${conta.nivel === 1 ? 'text-white font-bold' : 'text-slate-300'}`}
                                            style={{
                                                paddingLeft: `${(conta.nivel - 1) * 20}px`,
                                            }}
                                        >
                                            {temFilhas(conta.id) ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExpand(conta.id);
                                                    }}
                                                    className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
                                                    title={expandedIds.has(conta.id) ? "Colapsar" : "Expandir"}
                                                >
                                                    {expandedIds.has(conta.id) ? (
                                                        <ChevronDown size={16} />
                                                    ) : (
                                                        <ChevronRight size={16} />
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-4 flex-shrink-0"></div>
                                            )}
                                            <span className="flex-1">{conta.descricao}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            {conta.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                conta.natureza === "DEVEDORA"
                                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                            }`}
                                        >
                                            {conta.natureza}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {conta.aceita_lancamento ? (
                                            <span className="text-green-400 text-lg">✓</span>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <SaldoContaCell
                                            contaId={conta.id}
                                            aceitaLancamento={conta.aceita_lancamento}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={(e) => handleToggleAtivo(conta, e)}
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-all ${
                                                conta.ativo
                                                    ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                                                    : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                                            }`}
                                        >
                                            {conta.ativo ? "Ativo" : "Inativo"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVerDetalhes(conta);
                                                }}
                                                className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                title="Ver Detalhes"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditarConta(conta);
                                                }}
                                                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => handleExcluirConta(conta, e)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredContas.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            Nenhuma conta encontrada
                        </div>
                    )}
                </div>
            </div>

            {/* Paginação */}
            <Pagination
                currentPage={paginaAtual}
                totalPages={Math.ceil(filteredContas.length / itensPorPagina)}
                totalItems={filteredContas.length}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={setItensPorPagina}
            />

            {/* Modal de Cadastro/Edição */}
            <PlanoContasModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSalvarConta}
                conta={contaEditando}
                contas={contas}
            />

            {/* Modal de Detalhes */}
            <PlanoContasDetalhesModal
                conta={contaDetalhes}
                isOpen={isDetalhesModalOpen}
                onClose={() => setIsDetalhesModalOpen(false)}
            />
        </div>
    );
}
