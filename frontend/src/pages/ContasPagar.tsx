import { useState } from "react";
import { Search, Plus, DollarSign, Calendar, Tag, Check, X, AlertCircle, Clock, Filter as FilterIcon } from "lucide-react";
import { useContasPagar, useContasPagarMutations } from "../hooks/useContasPagar";
import type { ContaPagar, StatusContaPagar } from "../types";
import ContaPagarModal from "../components/ContaPagarModal";
import Pagination from "../components/Pagination";
import { showSuccess, showError } from "../lib/toast";

export default function ContasPagar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusContaPagar | "">("");
    const [categoriaFilter, setCategoriaFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contaEditando, setContaEditando] = useState<ContaPagar | null>(null);

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(10);

    const { data: contas = [], isLoading } = useContasPagar();
    const { criarConta, atualizarConta, marcarComoPago, deletarConta } = useContasPagarMutations();

    const getStatusBadge = (status: StatusContaPagar) => {
        const styles = {
            A_VENCER: "bg-blue-500/10 text-blue-400 border-blue-500/30",
            VENCIDO: "bg-red-500/10 text-red-400 border-red-500/30",
            PAGO: "bg-green-500/10 text-green-400 border-green-500/30",
            CANCELADO: "bg-gray-500/10 text-gray-400 border-gray-500/30",
        };
        const labels = {
            A_VENCER: "A Vencer",
            VENCIDO: "Vencido",
            PAGO: "Pago",
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

    const handleSave = async (data: Partial<ContaPagar>) => {
        try {
            if (contaEditando) {
                await atualizarConta.mutateAsync({ id: contaEditando.id, dados: data });
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

    const handleMarcarPago = async (id: number) => {
        if (!confirm("Confirmar pagamento desta conta?")) return;
        try {
            await marcarComoPago.mutateAsync({ id });
            showSuccess("Conta marcada como paga!");
        } catch (error) {
            showError("Erro ao marcar conta como paga", error);
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
            conta.fornecedor_nome?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = !statusFilter || conta.status === statusFilter;
        const matchCategoria = !categoriaFilter || conta.categoria === categoriaFilter;
        return matchSearch && matchStatus && matchCategoria;
    });

    const totalAPagar = filteredContas
        .filter((c) => c.status !== "PAGO" && c.status !== "CANCELADO")
        .reduce((sum, c) => sum + c.valor, 0);

    // Paginação
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = indiceInicio + itensPorPagina;
    const contasPaginadas = filteredContas.slice(indiceInicio, indiceFim);
    const totalPaginas = Math.ceil(filteredContas.length / itensPorPagina);

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
                <div className="absolute -top-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-red-400 text-sm font-medium px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                            Financeiro
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-red-100 to-orange-200 bg-clip-text text-transparent">
                        Contas a Pagar
                    </h1>
                    <p className="text-slate-400">
                        Gerencie suas despesas e compromissos financeiros
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total a Pagar</p>
                            <p className="text-2xl font-bold text-red-400">{formatCurrency(totalAPagar)}</p>
                        </div>
                        <DollarSign className="text-red-400" size={32} />
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
                            <p className="text-slate-400 text-sm mb-1">Vencidas</p>
                            <p className="text-2xl font-bold text-orange-400">
                                {filteredContas.filter((c) => c.status === "VENCIDO").length}
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
                            placeholder="Buscar por descrição ou fornecedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center font-medium ${
                                showFilters
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
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
                            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center font-medium hover:scale-105"
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
                                    onChange={(e) => setStatusFilter(e.target.value as StatusContaPagar | "")}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="A_VENCER">A Vencer</option>
                                    <option value="VENCIDO">Vencido</option>
                                    <option value="PAGO">Pago</option>
                                    <option value="CANCELADO">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                                <input
                                    type="text"
                                    value={categoriaFilter}
                                    onChange={(e) => setCategoriaFilter(e.target.value)}
                                    placeholder="Ex: Veículo, Aluguel..."
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Contas */}
            <div className="space-y-4">
                {contasPaginadas.map((conta) => (
                    <div
                        key={conta.id}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/30 transition-all"
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
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-400">
                                    {conta.fornecedor_nome && (
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} />
                                            <span>{conta.fornecedor_nome}</span>
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
                                    {conta.data_pagamento && (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Check size={16} />
                                            <span>Pago: {formatDate(conta.data_pagamento)}</span>
                                        </div>
                                    )}
                                </div>
                                {conta.observacoes && (
                                    <p className="text-sm text-slate-500 mt-2">{conta.observacoes}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-red-400">{formatCurrency(conta.valor)}</p>
                                </div>
                                {conta.status !== "PAGO" && conta.status !== "CANCELADO" && (
                                    <button
                                        onClick={() => handleMarcarPago(conta.id)}
                                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all"
                                        title="Marcar como Pago"
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

            {/* Paginação */}
            {totalPaginas > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={paginaAtual}
                        totalPages={totalPaginas}
                        onPageChange={setPaginaAtual}
                        totalItems={filteredContas.length}
                        itemsPerPage={itensPorPagina}
                        onItemsPerPageChange={setItensPorPagina}
                        showItemsPerPage={true}
                    />
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    Mostrando{" "}
                    <span className="text-white font-medium">
                        {indiceInicio + 1}
                    </span>{" "}
                    a{" "}
                    <span className="text-white font-medium">
                        {Math.min(indiceFim, filteredContas.length)}
                    </span>{" "}
                    de{" "}
                    <span className="text-white font-medium">
                        {filteredContas.length}
                    </span>{" "}
                    conta(s)
                </div>
            </div>

            {/* Modal de Cadastro/Edição */}
            <ContaPagarModal
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
