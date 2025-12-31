import { useState } from "react";
import {
    Search,
    Plus,
    Users,
    UserCheck,
    UserX,
    AlertTriangle,
} from "lucide-react";
import { useMotoristas } from "../hooks/useMotoristas";
import { useMotoristasMutations } from "../hooks/useMotoristasMutations";
import {
    LoadingSpinner,
    ErrorMessage,
    Pagination,
    TableActions,
    MotoristaModal,
} from "../components";
import type { Motorista } from "../types";
import { mascaraCPF } from "../lib/masks";
import toast from "react-hot-toast";

export default function Motoristas() {
    const [modalAberto, setModalAberto] = useState(false);
    const [motoristaSelecionado, setMotoristaSelecionado] = useState<Motorista | null>(null);
    const [busca, setBusca] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");
    const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
    const [filtroCNH, setFiltroCNH] = useState<string>("TODOS");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    const { data: motoristas = [], isLoading, error } = useMotoristas();
    const { criarMotorista, atualizarMotorista, deletarMotorista, toggleAtivoMotorista } =
        useMotoristasMutations();

    // Função para verificar se CNH está vencida ou próxima de vencer
    const verificarCNH = (validadeCnh: string) => {
        const hoje = new Date();
        const dataValidade = new Date(validadeCnh);
        const diffDias = Math.ceil((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDias < 0) return { status: "vencida", dias: diffDias };
        if (diffDias <= 30) return { status: "a_vencer", dias: diffDias };
        return { status: "valida", dias: diffDias };
    };

    // Filtrar motoristas
    const motoristasFiltrados = motoristas.filter((motorista) => {
        const buscaLower = busca.toLowerCase();
        const matchBusca =
            motorista.nome.toLowerCase().includes(buscaLower) ||
            motorista.cpf.includes(busca) ||
            motorista.cnh.includes(busca);

        const matchCategoria =
            filtroCategoria === "TODOS" || motorista.categoria_cnh === filtroCategoria;

        const matchStatus =
            filtroStatus === "TODOS" ||
            (filtroStatus === "ATIVO" && motorista.ativo) ||
            (filtroStatus === "INATIVO" && !motorista.ativo);

        const cnhStatus = verificarCNH(motorista.validade_cnh);
        const matchCNH =
            filtroCNH === "TODOS" ||
            (filtroCNH === "VENCIDA" && cnhStatus.status === "vencida") ||
            (filtroCNH === "A_VENCER" && cnhStatus.status === "a_vencer") ||
            (filtroCNH === "VALIDA" && cnhStatus.status === "valida");

        return matchBusca && matchCategoria && matchStatus && matchCNH;
    });

    // Calcular estatísticas
    const totalMotoristas = motoristas.length;
    const motoristasAtivos = motoristas.filter((m) => m.ativo).length;
    const motoristasInativos = motoristas.filter((m) => !m.ativo).length;
    const cnhAVencer = motoristas.filter((m) => {
        const status = verificarCNH(m.validade_cnh);
        return status.status === "a_vencer" || status.status === "vencida";
    }).length;

    // Paginação
    const totalPaginas = Math.ceil(motoristasFiltrados.length / itensPorPagina);
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const indiceFinal = indiceInicial + itensPorPagina;
    const motoristasPaginados = motoristasFiltrados.slice(indiceInicial, indiceFinal);

    const handleNovo = () => {
        setMotoristaSelecionado(null);
        setModalAberto(true);
    };

    const handleEditar = (motorista: Motorista) => {
        setMotoristaSelecionado(motorista);
        setModalAberto(true);
    };

    const handleDeletar = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este motorista?")) {
            return;
        }

        try {
            await deletarMotorista.mutateAsync(id);
            toast.success("Motorista excluído com sucesso!");
        } catch (error) {
            toast.error("Erro ao excluir motorista");
            console.error(error);
        }
    };

    const handleToggleAtivo = async (motorista: Motorista) => {
        try {
            await toggleAtivoMotorista.mutateAsync({
                id: motorista.id,
                ativo: !motorista.ativo,
            });
            toast.success(
                `Motorista ${!motorista.ativo ? "ativado" : "desativado"} com sucesso!`
            );
        } catch (error) {
            toast.error("Erro ao atualizar status do motorista");
            console.error(error);
        }
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setMotoristaSelecionado(null);
    };

    const handleSalvar = async (dados: Partial<Motorista>) => {
        if (motoristaSelecionado) {
            await atualizarMotorista.mutateAsync({
                id: motoristaSelecionado.id,
                dados,
            });
            toast.success("Motorista atualizado com sucesso!");
        } else {
            await criarMotorista.mutateAsync(dados);
            toast.success("Motorista criado com sucesso!");
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Erro ao carregar motoristas" />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-purple-400 text-sm font-medium px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
                            Recursos Humanos
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-purple-100 to-violet-200 bg-clip-text text-transparent">
                        Motoristas
                    </h1>
                    <p className="text-slate-400">
                        Gerenciamento de motoristas e operadores
                    </p>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total</p>
                            <p className="text-3xl font-bold text-white">{totalMotoristas}</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Users className="text-purple-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Ativos</p>
                            <p className="text-3xl font-bold text-white">{motoristasAtivos}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <UserCheck className="text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Inativos</p>
                            <p className="text-3xl font-bold text-white">{motoristasInativos}</p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <UserX className="text-red-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">CNH a Vencer</p>
                            <p className="text-3xl font-bold text-white">{cnhAVencer}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <AlertTriangle className="text-yellow-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Busca */}
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Buscar por nome, CPF ou CNH..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filtro Categoria */}
                    <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        <option value="TODOS">Todas Categorias</option>
                        <option value="A">Categoria A</option>
                        <option value="B">Categoria B</option>
                        <option value="C">Categoria C</option>
                        <option value="D">Categoria D</option>
                        <option value="E">Categoria E</option>
                        <option value="AB">Categoria AB</option>
                        <option value="AC">Categoria AC</option>
                        <option value="AD">Categoria AD</option>
                        <option value="AE">Categoria AE</option>
                    </select>

                    {/* Filtro Status */}
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        <option value="TODOS">Todos Status</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="INATIVO">Inativos</option>
                    </select>

                    {/* Filtro CNH */}
                    <select
                        value={filtroCNH}
                        onChange={(e) => setFiltroCNH(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        <option value="TODOS">Todas CNH</option>
                        <option value="VALIDA">Válidas</option>
                        <option value="A_VENCER">A Vencer</option>
                        <option value="VENCIDA">Vencidas</option>
                    </select>

                    {/* Botão Novo */}
                    <button
                        onClick={handleNovo}
                        className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center font-medium whitespace-nowrap"
                    >
                        <Plus size={20} className="mr-2" />
                        Novo Motorista
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    CPF
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    CNH
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Categoria
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Validade CNH
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Telefone
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {motoristasPaginados.map((motorista) => {
                                const cnhStatus = verificarCNH(motorista.validade_cnh);
                                return (
                                    <tr
                                        key={motorista.id}
                                        className="hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">
                                                {motorista.nome}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-400">
                                                {mascaraCPF(motorista.cpf)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-400">
                                                {motorista.cnh}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                {motorista.categoria_cnh}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-400">
                                                    {new Date(motorista.validade_cnh).toLocaleDateString(
                                                        "pt-BR"
                                                    )}
                                                </span>
                                                {cnhStatus.status === "vencida" && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                                        Vencida
                                                    </span>
                                                )}
                                                {cnhStatus.status === "a_vencer" && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                        {cnhStatus.dias}d
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {motorista.telefone || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleAtivo(motorista)}
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-all ${
                                                    motorista.ativo
                                                        ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                                                        : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                                                }`}
                                            >
                                                {motorista.ativo ? "Ativo" : "Inativo"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <TableActions
                                                onEdit={() => handleEditar(motorista)}
                                                onDelete={() => handleDeletar(motorista.id)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {motoristasPaginados.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400 text-lg">
                                Nenhum motorista encontrado
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={paginaAtual}
                        totalPages={totalPaginas}
                        onPageChange={setPaginaAtual}
                        totalItems={motoristasFiltrados.length}
                        showItemsPerPage={false}
                    />
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    Mostrando{" "}
                    <span className="text-white font-medium">
                        {indiceInicial + 1}
                    </span>{" "}
                    a{" "}
                    <span className="text-white font-medium">
                        {Math.min(indiceFinal, motoristasFiltrados.length)}
                    </span>{" "}
                    de{" "}
                    <span className="text-white font-medium">
                        {motoristasFiltrados.length}
                    </span>{" "}
                    motorista(s)
                </div>
            </div>

            {/* Modal */}
            <MotoristaModal
                isOpen={modalAberto}
                onClose={handleFecharModal}
                onSave={handleSalvar}
                motorista={motoristaSelecionado}
            />
        </div>
    );
}
