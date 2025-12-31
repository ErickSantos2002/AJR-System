import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Filter, X, UserCheck, UserX, Phone, Mail } from "lucide-react";
import { useClientes } from "../hooks/useClientes";
import { useClientesMutations } from "../hooks/useClientesMutations";
import type { Cliente } from "../types";
import { ClienteModal, LoadingSpinner, ErrorMessage, Pagination } from "../components";
import { showSuccess, showError } from "../lib/toast";
import { mascaraCPF, mascaraCNPJ, mascaraTelefone } from "../lib/masks";

export default function Clientes() {
    const [searchTerm, setSearchTerm] = useState("");
    const [tipoFilter, setTipoFilter] = useState<"" | "F" | "J">("");
    const [ativoFilter, setAtivoFilter] = useState<string>("true");
    const [estadoFilter, setEstadoFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(25);

    const { data: clientes = [], isLoading, isError, error, refetch } = useClientes();
    const { criarCliente, atualizarCliente, deletarCliente, toggleAtivoCliente } = useClientesMutations();

    const handleSave = async (data: Partial<Cliente>) => {
        try {
            if (clienteEditando) {
                await atualizarCliente.mutateAsync({ id: clienteEditando.id, dados: data });
                showSuccess("Cliente atualizado com sucesso!");
            } else {
                await criarCliente.mutateAsync(data);
                showSuccess("Cliente criado com sucesso!");
            }
        } catch (error) {
            showError("Erro ao salvar cliente", error);
            throw error;
        }
    };

    const handleExcluir = async (id: number, nome: string) => {
        if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) return;

        try {
            await deletarCliente.mutateAsync(id);
            showSuccess("Cliente excluído com sucesso!");
        } catch (error) {
            showError("Erro ao excluir cliente", error);
        }
    };

    const handleToggleAtivo = async (id: number, ativo: boolean, _nome: string) => {
        try {
            await toggleAtivoCliente.mutateAsync({ id, ativo: !ativo });
            showSuccess(`Cliente ${!ativo ? "ativado" : "inativado"} com sucesso!`);
        } catch (error) {
            showError(`Erro ao ${!ativo ? "ativar" : "inativar"} cliente`, error);
        }
    };

    const limparFiltros = () => {
        setSearchTerm("");
        setTipoFilter("");
        setAtivoFilter("true");
        setEstadoFilter("");
    };

    const filteredClientes = clientes.filter((cliente) => {
        const matchSearch =
            !searchTerm ||
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.cpf_cnpj.includes(searchTerm.replace(/\D/g, "")) ||
            cliente.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTipo = !tipoFilter || cliente.tipo_pessoa === tipoFilter;
        const matchAtivo = !ativoFilter || cliente.ativo === (ativoFilter === "true");
        const matchEstado = !estadoFilter || cliente.estado === estadoFilter;

        return matchSearch && matchTipo && matchAtivo && matchEstado;
    });

    // Paginação
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = indiceInicio + itensPorPagina;
    const clientesPaginados = filteredClientes.slice(indiceInicio, indiceFim);

    if (isLoading) return <LoadingSpinner fullScreen text="Carregando clientes..." />;
    if (isError) return <ErrorMessage message="Não foi possível carregar os clientes." error={error as Error} onRetry={refetch} fullScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-cyan-400 text-sm font-medium px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                            Cadastros
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                        Clientes
                    </h1>
                    <p className="text-slate-400">
                        Gerenciamento de clientes e fornecedores
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total de Clientes</p>
                            <p className="text-2xl font-bold text-cyan-400">{filteredClientes.length}</p>
                        </div>
                        <UserCheck className="text-cyan-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Ativos</p>
                            <p className="text-2xl font-bold text-green-400">
                                {filteredClientes.filter((c) => c.ativo).length}
                            </p>
                        </div>
                        <UserCheck className="text-green-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Inativos</p>
                            <p className="text-2xl font-bold text-red-400">
                                {filteredClientes.filter((c) => !c.ativo).length}
                            </p>
                        </div>
                        <UserX className="text-red-400" size={32} />
                    </div>
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
                            placeholder="Buscar por nome, CPF/CNPJ, cidade ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl transition-all flex items-center font-medium ${
                                showFilters
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                            <Filter size={20} className="mr-2" />
                            Filtros
                        </button>
                        <button
                            onClick={() => {
                                setClienteEditando(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center font-medium hover:scale-105"
                        >
                            <Plus size={20} className="mr-2" />
                            Novo Cliente
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="border-t border-slate-700/50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Pessoa</label>
                                <select
                                    value={tipoFilter}
                                    onChange={(e) => setTipoFilter(e.target.value as "" | "F" | "J")}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="F">Pessoa Física</option>
                                    <option value="J">Pessoa Jurídica</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                <select
                                    value={ativoFilter}
                                    onChange={(e) => setAtivoFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Apenas Ativos</option>
                                    <option value="false">Apenas Inativos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                                <select
                                    value={estadoFilter}
                                    onChange={(e) => setEstadoFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Todos os Estados</option>
                                    <option value="SP">SP</option>
                                    <option value="RJ">RJ</option>
                                    <option value="MG">MG</option>
                                    <option value="RS">RS</option>
                                    <option value="PR">PR</option>
                                    <option value="SC">SC</option>
                                    {/* Adicionar outros estados conforme necessário */}
                                </select>
                            </div>
                        </div>

                        {/* Botão Limpar Filtros */}
                        {(tipoFilter || ativoFilter !== "true" || estadoFilter || searchTerm) && (
                            <button
                                onClick={limparFiltros}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-sm rounded-lg transition-colors"
                            >
                                <X size={14} />
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    CPF/CNPJ
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Contato
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Cidade/UF
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {clientesPaginados.map((cliente) => (
                                <tr
                                    key={cliente.id}
                                    className="hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {cliente.nome}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-400 font-mono">
                                            {cliente.tipo_pessoa === "F"
                                                ? mascaraCPF(cliente.cpf_cnpj)
                                                : mascaraCNPJ(cliente.cpf_cnpj)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                            {cliente.tipo_pessoa === "F" ? "Física" : "Jurídica"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-400 space-y-1">
                                            {cliente.telefone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {mascaraTelefone(cliente.telefone)}
                                                </div>
                                            )}
                                            {cliente.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {cliente.email}
                                                </div>
                                            )}
                                            {!cliente.telefone && !cliente.email && "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {cliente.cidade && cliente.estado
                                            ? `${cliente.cidade}/${cliente.estado}`
                                            : cliente.cidade || cliente.estado || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                cliente.ativo
                                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                                            }`}
                                        >
                                            {cliente.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setClienteEditando(cliente);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleAtivo(cliente.id, cliente.ativo, cliente.nome)}
                                                className={`p-2 rounded-lg transition-all ${
                                                    cliente.ativo
                                                        ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                                        : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                                }`}
                                                title={cliente.ativo ? "Inativar" : "Ativar"}
                                            >
                                                {cliente.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(cliente.id, cliente.nome)}
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

                    {filteredClientes.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            Nenhum cliente encontrado
                        </div>
                    )}
                </div>
            </div>

            {/* Paginação */}
            <Pagination
                currentPage={paginaAtual}
                totalItems={filteredClientes.length}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={setItensPorPagina}
            />

            {/* Modal */}
            <ClienteModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setClienteEditando(null);
                }}
                onSave={handleSave}
                cliente={clienteEditando}
            />
        </div>
    );
}
