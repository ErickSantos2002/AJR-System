import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Filter, X, Power, PowerOff, Gauge, Calendar } from "lucide-react";
import { useEquipamentos } from "../hooks/useEquipamentos";
import { useEquipamentosMutations } from "../hooks/useEquipamentosMutations";
import type { Equipamento } from "../types";
import { EquipamentoModal, LoadingSpinner, ErrorMessage, Pagination } from "../components";
import { showSuccess, showError } from "../lib/toast";
import { mascaraPlaca } from "../lib/masks";

const TIPOS_EQUIPAMENTO: Record<Equipamento["tipo"], string> = {
    CAMINHAO: "Caminhão",
    RETROESCAVADEIRA: "Retroescavadeira",
    ESCAVADEIRA: "Escavadeira",
    TRATOR: "Trator",
    PA_CARREGADEIRA: "Pá Carregadeira",
    ROLO_COMPACTADOR: "Rolo Compactador",
    OUTRO: "Outro",
};

export default function Equipamentos() {
    const [searchTerm, setSearchTerm] = useState("");
    const [tipoFilter, setTipoFilter] = useState<Equipamento["tipo"] | "">("");
    const [ativoFilter, setAtivoFilter] = useState<string>("true");
    const [showFilters, setShowFilters] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [equipamentoEditando, setEquipamentoEditando] = useState<Equipamento | null>(null);

    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(25);

    const { data: equipamentos = [], isLoading, isError, error, refetch } = useEquipamentos();
    const { criarEquipamento, atualizarEquipamento, deletarEquipamento, toggleAtivoEquipamento } = useEquipamentosMutations();

    const handleSave = async (data: Partial<Equipamento>) => {
        try {
            if (equipamentoEditando) {
                await atualizarEquipamento.mutateAsync({ id: equipamentoEditando.id, dados: data });
                showSuccess("Equipamento atualizado com sucesso!");
            } else {
                await criarEquipamento.mutateAsync(data);
                showSuccess("Equipamento criado com sucesso!");
            }
        } catch (error) {
            showError("Erro ao salvar equipamento", error);
            throw error;
        }
    };

    const handleExcluir = async (id: number, identificador: string) => {
        if (!confirm(`Tem certeza que deseja excluir o equipamento "${identificador}"?`)) return;

        try {
            await deletarEquipamento.mutateAsync(id);
            showSuccess("Equipamento excluído com sucesso!");
        } catch (error) {
            showError("Erro ao excluir equipamento", error);
        }
    };

    const handleToggleAtivo = async (id: number, ativo: boolean, _identificador: string) => {
        try {
            await toggleAtivoEquipamento.mutateAsync({ id, ativo: !ativo });
            showSuccess(`Equipamento ${!ativo ? "ativado" : "inativado"} com sucesso!`);
        } catch (error) {
            showError(`Erro ao ${!ativo ? "ativar" : "inativar"} equipamento`, error);
        }
    };

    const limparFiltros = () => {
        setSearchTerm("");
        setTipoFilter("");
        setAtivoFilter("true");
    };

    const filteredEquipamentos = equipamentos.filter((equip) => {
        const matchSearch =
            !searchTerm ||
            equip.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equip.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equip.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equip.placa?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTipo = !tipoFilter || equip.tipo === tipoFilter;
        const matchAtivo = !ativoFilter || equip.ativo === (ativoFilter === "true");

        return matchSearch && matchTipo && matchAtivo;
    });

    // Paginação
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const indiceFim = indiceInicio + itensPorPagina;
    const equipamentosPaginados = filteredEquipamentos.slice(indiceInicio, indiceFim);

    if (isLoading) return <LoadingSpinner fullScreen text="Carregando equipamentos..." />;
    if (isError) return <ErrorMessage message="Não foi possível carregar os equipamentos." error={error as Error} onRetry={refetch} fullScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-cyan-400 text-sm font-medium px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                            Frota
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-cyan-100 to-teal-200 bg-clip-text text-transparent">
                        Equipamentos
                    </h1>
                    <p className="text-slate-400">
                        Gerenciamento de veículos e equipamentos
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total de Equipamentos</p>
                            <p className="text-2xl font-bold text-cyan-400">{filteredEquipamentos.length}</p>
                        </div>
                        <Gauge className="text-cyan-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Ativos</p>
                            <p className="text-2xl font-bold text-green-400">
                                {filteredEquipamentos.filter((e) => e.ativo).length}
                            </p>
                        </div>
                        <Power className="text-green-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Inativos</p>
                            <p className="text-2xl font-bold text-red-400">
                                {filteredEquipamentos.filter((e) => !e.ativo).length}
                            </p>
                        </div>
                        <PowerOff className="text-red-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Tipos</p>
                            <p className="text-2xl font-bold text-purple-400">
                                {new Set(filteredEquipamentos.map((e) => e.tipo)).size}
                            </p>
                        </div>
                        <Calendar className="text-purple-400" size={32} />
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
                            placeholder="Buscar por identificador, marca, modelo ou placa..."
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
                                setEquipamentoEditando(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center font-medium hover:scale-105"
                        >
                            <Plus size={20} className="mr-2" />
                            Novo Equipamento
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="border-t border-slate-700/50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Equipamento</label>
                                <select
                                    value={tipoFilter}
                                    onChange={(e) => setTipoFilter(e.target.value as Equipamento["tipo"] | "")}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="">Todos os Tipos</option>
                                    {Object.entries(TIPOS_EQUIPAMENTO).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
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
                        </div>

                        {/* Botão Limpar Filtros */}
                        {(tipoFilter || ativoFilter !== "true" || searchTerm) && (
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
                                    Identificador
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Marca/Modelo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Placa
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Ano
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Hodômetro
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
                            {equipamentosPaginados.map((equip) => (
                                <tr
                                    key={equip.id}
                                    className="hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {equip.identificador}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {TIPOS_EQUIPAMENTO[equip.tipo]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {equip.marca} {equip.modelo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                                        {equip.placa ? mascaraPlaca(equip.placa) : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {equip.ano_fabricacao || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {equip.hodometro_atual ? `${equip.hodometro_atual}h` : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                equip.ativo
                                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                                            }`}
                                        >
                                            {equip.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEquipamentoEditando(equip);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleAtivo(equip.id, equip.ativo, equip.identificador)}
                                                className={`p-2 rounded-lg transition-all ${
                                                    equip.ativo
                                                        ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                                        : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                                }`}
                                                title={equip.ativo ? "Inativar" : "Ativar"}
                                            >
                                                {equip.ativo ? <PowerOff size={16} /> : <Power size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(equip.id, equip.identificador)}
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

                    {filteredEquipamentos.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            Nenhum equipamento encontrado
                        </div>
                    )}
                </div>
            </div>

            {/* Paginação */}
            <Pagination
                currentPage={paginaAtual}
                totalItems={filteredEquipamentos.length}
                itemsPerPage={itensPorPagina}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={setItensPorPagina}
            />

            {/* Modal */}
            <EquipamentoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEquipamentoEditando(null);
                }}
                onSave={handleSave}
                equipamento={equipamentoEditando}
            />
        </div>
    );
}
