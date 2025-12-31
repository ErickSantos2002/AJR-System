import { useState } from "react";
import { Search, Plus, DollarSign, Calendar, Tag, Check, X, AlertCircle, Clock, Filter as FilterIcon, FileText } from "lucide-react";
import { useContasReceber, useContasReceberMutations } from "../hooks/useContasReceber";
import type { ContaReceber, StatusContaReceber } from "../types";
import ContaReceberModal from "../components/ContaReceberModal";
import { showSuccess, showError } from "../lib/toast";

export default function ContasReceber() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusContaReceber | "">("");
    const [categoriaFilter, setCategoriaFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contaEditando, setContaEditando] = useState<ContaReceber | null>(null);

    const { data: contas = [], isLoading } = useContasReceber();
    const { criarConta, atualizarConta, marcarComoRecebido, deletarConta } = useContasReceberMutations();

    const getStatusBadge = (status: StatusContaReceber) => {
        const styles = {
            A_RECEBER: "bg-blue-500/10 text-blue-400 border-blue-500/30",
            ATRASADO: "bg-orange-500/10 text-orange-400 border-orange-500/30",
            RECEBIDO: "bg-green-500/10 text-green-400 border-green-500/30",
            CANCELADO: "bg-gray-500/10 text-gray-400 border-gray-500/30",
        };
        const labels = {
            A_RECEBER: "A Receber",
            ATRASADO: "Atrasado",
            RECEBIDO: "Recebido",
            CANCELADO: "Cancelado",
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const handleSave = async (data: Partial<ContaReceber>) => {
        try {
            if (contaEditando) {
                await atualizarConta.mutateAsync({ id: contaEditando.id, data });
                showSuccess("Conta atualizada com sucesso!");
            } else {
                await criarConta.mutateAsync(data);
                showSuccess("Conta criada com sucesso!");
            }
        } catch (error) {
            showError("Erro ao salvar conta", error);
            throw error;
        }
    };

    const handleMarcarRecebido = async (id: number) => {
        if (!confirm("Confirmar recebimento desta conta?")) return;
        try {
            await marcarComoRecebido.mutateAsync({ id });
            showSuccess("Conta marcada como recebida!");
        } catch (error) {
            showError("Erro ao marcar conta como recebida", error);
        }
    };

    const handleExcluir = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
        try {
            await deletarConta.mutateAsync(id);
            showSuccess("Conta excluída com sucesso!");
        } catch (error) {
            showError("Erro ao excluir conta", error);
        }
    };

    const filteredContas = contas.filter((conta) => {
        const matchSearch =
            conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conta.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conta.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = !statusFilter || conta.status === statusFilter;
        const matchCategoria = !categoriaFilter || conta.categoria === categoriaFilter;
        return matchSearch && matchStatus && matchCategoria;
    });

    const totalAReceber = filteredContas
        .filter((c) => c.status !== "RECEBIDO" && c.status !== "CANCELADO")
        .reduce((sum, c) => sum + c.valor, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex items-center justify-center">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-green-400 text-sm font-medium px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
                            Financeiro
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-green-100 to-emerald-200 bg-clip-text text-transparent">
                        Contas a Receber
                    </h1>
                    <p className="text-slate-400">
                        Gerencie suas receitas e recebimentos
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total a Receber</p>
                            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalAReceber)}</p>
                        </div>
                        <DollarSign className="text-green-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total de Contas</p>
                            <p className="text-2xl font-bold text-white">{filteredContas.length}</p>
                        </div>
                        <Calendar className="text-slate-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Atrasadas</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {filteredContas.filter((c) => c.status === "ATRASADO").length}
                            </p>
                        </div>
                        <AlertCircle className="text-orange-400" size={32} />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por descrição, cliente ou documento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center font-medium ${
                                showFilters
                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            <FilterIcon size={20} className="mr-2" />
                            Filtros
                        </button>
                        <button
                            onClick={() => {
                                setContaEditando(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center font-medium hover:scale-105"
                        >
                            <Plus size={20} className="mr-2" />
                            Nova Conta
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="border-t border-slate-700/50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as StatusContaReceber | "")}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="A_RECEBER">A Receber</option>
                                    <option value="ATRASADO">Atrasado</option>
                                    <option value="RECEBIDO">Recebido</option>
                                    <option value="CANCELADO">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                                <input
                                    type="text"
                                    value={categoriaFilter}
                                    onChange={(e) => setCategoriaFilter(e.target.value)}
                                    placeholder="Ex: Serviços, Vendas..."
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Contas */}
            <div className="space-y-4">
                {filteredContas.map((conta) => (
                    <div
                        key={conta.id}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-white">{conta.descricao}</h3>
                                    {getStatusBadge(conta.status)}
                                    {conta.parcela_numero && (
                                        <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                                            {conta.parcela_numero}/{conta.parcela_total}
                                        </span>
                                    )}
                                    {conta.numero_documento && (
                                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                                            <FileText size={12} />
                                            <span>{conta.numero_documento}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-400">
                                    {conta.cliente_nome && (
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} />
                                            <span>{conta.cliente_nome}</span>
                                        </div>
                                    )}
                                    {conta.categoria && (
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} />
                                            <span>{conta.categoria}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Vence: {formatDate(conta.data_vencimento)}</span>
                                    </div>
                                    {conta.data_recebimento && (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Check size={16} />
                                            <span>Recebido: {formatDate(conta.data_recebimento)}</span>
                                        </div>
                                    )}
                                </div>
                                {conta.observacoes && (
                                    <p className="text-sm text-slate-500 mt-2">{conta.observacoes}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(conta.valor)}</p>
                                </div>
                                {conta.status !== "RECEBIDO" && conta.status !== "CANCELADO" && (
                                    <button
                                        onClick={() => handleMarcarRecebido(conta.id)}
                                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                                        title="Marcar como Recebido"
                                    >
                                        <Check size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleExcluir(conta.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                    title="Excluir"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredContas.length === 0 && (
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
                        <Clock className="mx-auto mb-4 text-slate-600" size={48} />
                        <p className="text-slate-400">Nenhuma conta encontrada</p>
                    </div>
                )}
            </div>

            {/* Modal de Cadastro/Edição */}
            <ContaReceberModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setContaEditando(null);
                }}
                onSave={handleSave}
                conta={contaEditando}
            />
        </div>
    );
}
