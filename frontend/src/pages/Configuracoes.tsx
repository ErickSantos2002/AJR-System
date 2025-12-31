import { useState } from "react";
import { Search, Plus, BookOpen, Building2, CheckCircle2, XCircle, List } from "lucide-react";
import { useHistoricos } from "../hooks/useHistoricos";
import { useHistoricosMutations } from "../hooks/useHistoricosMutations";
import { useCentrosCusto } from "../hooks/useCentrosCusto";
import { useCentrosCustoMutations } from "../hooks/useCentrosCustoMutations";
import {
    LoadingSpinner,
    ErrorMessage,
    TableActions,
    HistoricoModal,
    CentroCustoModal,
} from "../components";
import type { Historico, CentroCusto } from "../types";
import toast from "react-hot-toast";

type Tab = "historicos" | "centros-custo";

export default function Configuracoes() {
    const [activeTab, setActiveTab] = useState<Tab>("historicos");
    const [busca, setBusca] = useState("");

    // Estados para Históricos
    const [historicoModalAberto, setHistoricoModalAberto] = useState(false);
    const [historicoSelecionado, setHistoricoSelecionado] = useState<Historico | null>(null);

    // Estados para Centros de Custo
    const [centroCustoModalAberto, setCentroCustoModalAberto] = useState(false);
    const [centroCustoSelecionado, setCentroCustoSelecionado] = useState<CentroCusto | null>(null);

    // Queries
    const {
        data: historicos = [],
        isLoading: loadingHistoricos,
        error: errorHistoricos,
    } = useHistoricos();

    const {
        data: centrosCusto = [],
        isLoading: loadingCentrosCusto,
        error: errorCentrosCusto,
    } = useCentrosCusto();

    // Mutations
    const {
        criarHistorico,
        atualizarHistorico,
        deletarHistorico,
        toggleAtivoHistorico,
    } = useHistoricosMutations();

    const {
        criarCentroCusto,
        atualizarCentroCusto,
        deletarCentroCusto,
        toggleAtivoCentroCusto,
    } = useCentrosCustoMutations();

    // Filtros
    const historicosFiltrados = historicos.filter(
        (hist) =>
            hist.codigo.toLowerCase().includes(busca.toLowerCase()) ||
            hist.descricao.toLowerCase().includes(busca.toLowerCase())
    );

    const centrosCustoFiltrados = centrosCusto.filter(
        (cc) =>
            cc.codigo.toLowerCase().includes(busca.toLowerCase()) ||
            cc.descricao.toLowerCase().includes(busca.toLowerCase())
    );

    // Estatísticas - Históricos
    const totalHistoricos = historicos.length;
    const historicosAtivos = historicos.filter((h) => h.ativo).length;
    const historicosInativos = historicos.filter((h) => !h.ativo).length;

    // Estatísticas - Centros de Custo
    const totalCentrosCusto = centrosCusto.length;
    const centrosCustoAtivos = centrosCusto.filter((c) => c.ativo).length;
    const centrosCustoInativos = centrosCusto.filter((c) => !c.ativo).length;

    // Handlers - Históricos
    const handleNovoHistorico = () => {
        setHistoricoSelecionado(null);
        setHistoricoModalAberto(true);
    };

    const handleEditarHistorico = (historico: Historico) => {
        setHistoricoSelecionado(historico);
        setHistoricoModalAberto(true);
    };

    const handleDeletarHistorico = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este histórico?")) {
            return;
        }

        try {
            await deletarHistorico.mutateAsync(id);
            toast.success("Histórico excluído com sucesso!");
        } catch (error) {
            toast.error("Erro ao excluir histórico");
            console.error(error);
        }
    };

    const handleToggleAtivoHistorico = async (historico: Historico) => {
        try {
            await toggleAtivoHistorico.mutateAsync({
                id: historico.id,
                ativo: !historico.ativo,
            });
            toast.success(
                `Histórico ${!historico.ativo ? "ativado" : "desativado"} com sucesso!`
            );
        } catch (error) {
            toast.error("Erro ao atualizar status do histórico");
            console.error(error);
        }
    };

    const handleSalvarHistorico = async (dados: Partial<Historico>) => {
        if (historicoSelecionado) {
            await atualizarHistorico.mutateAsync({
                id: historicoSelecionado.id,
                dados,
            });
            toast.success("Histórico atualizado com sucesso!");
        } else {
            await criarHistorico.mutateAsync(dados);
            toast.success("Histórico criado com sucesso!");
        }
    };

    // Handlers - Centros de Custo
    const handleNovoCentroCusto = () => {
        setCentroCustoSelecionado(null);
        setCentroCustoModalAberto(true);
    };

    const handleEditarCentroCusto = (centroCusto: CentroCusto) => {
        setCentroCustoSelecionado(centroCusto);
        setCentroCustoModalAberto(true);
    };

    const handleDeletarCentroCusto = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este centro de custo?")) {
            return;
        }

        try {
            await deletarCentroCusto.mutateAsync(id);
            toast.success("Centro de custo excluído com sucesso!");
        } catch (error) {
            toast.error("Erro ao excluir centro de custo");
            console.error(error);
        }
    };

    const handleToggleAtivoCentroCusto = async (centroCusto: CentroCusto) => {
        try {
            await toggleAtivoCentroCusto.mutateAsync({
                id: centroCusto.id,
                ativo: !centroCusto.ativo,
            });
            toast.success(
                `Centro de custo ${!centroCusto.ativo ? "ativado" : "desativado"} com sucesso!`
            );
        } catch (error) {
            toast.error("Erro ao atualizar status do centro de custo");
            console.error(error);
        }
    };

    const handleSalvarCentroCusto = async (dados: Partial<CentroCusto>) => {
        if (centroCustoSelecionado) {
            await atualizarCentroCusto.mutateAsync({
                id: centroCustoSelecionado.id,
                dados,
            });
            toast.success("Centro de custo atualizado com sucesso!");
        } else {
            await criarCentroCusto.mutateAsync(dados);
            toast.success("Centro de custo criado com sucesso!");
        }
    };

    const isLoading = activeTab === "historicos" ? loadingHistoricos : loadingCentrosCusto;
    const error = activeTab === "historicos" ? errorHistoricos : errorCentrosCusto;

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message="Erro ao carregar configurações" />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-slate-400 text-sm font-medium px-4 py-2 rounded-full border border-slate-500/30 bg-slate-500/10 backdrop-blur-sm">
                            Sistema
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                        Configurações
                    </h1>
                    <p className="text-slate-400">
                        Gerenciamento de históricos e centros de custo
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setActiveTab("historicos");
                            setBusca("");
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                            activeTab === "historicos"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        }`}
                    >
                        <BookOpen size={20} />
                        Históricos
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("centros-custo");
                            setBusca("");
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                            activeTab === "centros-custo"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        }`}
                    >
                        <Building2 size={20} />
                        Centros de Custo
                    </button>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total</p>
                            <p className="text-3xl font-bold text-white">
                                {activeTab === "historicos"
                                    ? totalHistoricos
                                    : totalCentrosCusto}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <List className="text-blue-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Ativos</p>
                            <p className="text-3xl font-bold text-white">
                                {activeTab === "historicos"
                                    ? historicosAtivos
                                    : centrosCustoAtivos}
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <CheckCircle2 className="text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Inativos</p>
                            <p className="text-3xl font-bold text-white">
                                {activeTab === "historicos"
                                    ? historicosInativos
                                    : centrosCustoInativos}
                            </p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <XCircle className="text-red-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Buscar por código ou descrição..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        onClick={
                            activeTab === "historicos"
                                ? handleNovoHistorico
                                : handleNovoCentroCusto
                        }
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center font-medium whitespace-nowrap"
                    >
                        <Plus size={20} className="mr-2" />
                        {activeTab === "historicos"
                            ? "Novo Histórico"
                            : "Novo Centro de Custo"}
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
                                    Código
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Descrição
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
                            {activeTab === "historicos"
                                ? historicosFiltrados.map((historico) => (
                                      <tr
                                          key={historico.id}
                                          className="hover:bg-slate-800/30 transition-colors"
                                      >
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="text-sm font-mono text-cyan-400">
                                                  {historico.codigo}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="text-sm text-white">
                                                  {historico.descricao}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <button
                                                  onClick={() =>
                                                      handleToggleAtivoHistorico(historico)
                                                  }
                                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-all ${
                                                      historico.ativo
                                                          ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                                                          : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                                                  }`}
                                              >
                                                  {historico.ativo ? "Ativo" : "Inativo"}
                                              </button>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <TableActions
                                                  onEdit={() => handleEditarHistorico(historico)}
                                                  onDelete={() =>
                                                      handleDeletarHistorico(historico.id)
                                                  }
                                              />
                                          </td>
                                      </tr>
                                  ))
                                : centrosCustoFiltrados.map((centroCusto) => (
                                      <tr
                                          key={centroCusto.id}
                                          className="hover:bg-slate-800/30 transition-colors"
                                      >
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="text-sm font-mono text-cyan-400">
                                                  {centroCusto.codigo}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="text-sm text-white">
                                                  {centroCusto.descricao}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <button
                                                  onClick={() =>
                                                      handleToggleAtivoCentroCusto(centroCusto)
                                                  }
                                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-all ${
                                                      centroCusto.ativo
                                                          ? "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                                                          : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                                                  }`}
                                              >
                                                  {centroCusto.ativo ? "Ativo" : "Inativo"}
                                              </button>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                              <TableActions
                                                  onEdit={() =>
                                                      handleEditarCentroCusto(centroCusto)
                                                  }
                                                  onDelete={() =>
                                                      handleDeletarCentroCusto(centroCusto.id)
                                                  }
                                              />
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>

                    {(activeTab === "historicos"
                        ? historicosFiltrados
                        : centrosCustoFiltrados
                    ).length === 0 && (
                        <div className="text-center py-12">
                            {activeTab === "historicos" ? (
                                <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                            ) : (
                                <Building2 className="mx-auto text-slate-600 mb-4" size={48} />
                            )}
                            <p className="text-slate-400 text-lg">
                                Nenhum{" "}
                                {activeTab === "historicos"
                                    ? "histórico"
                                    : "centro de custo"}{" "}
                                encontrado
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    Total:{" "}
                    <span className="text-white font-medium">
                        {activeTab === "historicos"
                            ? historicosFiltrados.length
                            : centrosCustoFiltrados.length}
                    </span>{" "}
                    {activeTab === "historicos" ? "histórico(s)" : "centro(s) de custo"}
                </div>
            </div>

            {/* Modais */}
            <HistoricoModal
                isOpen={historicoModalAberto}
                onClose={() => setHistoricoModalAberto(false)}
                onSave={handleSalvarHistorico}
                historico={historicoSelecionado}
            />

            <CentroCustoModal
                isOpen={centroCustoModalAberto}
                onClose={() => setCentroCustoModalAberto(false)}
                onSave={handleSalvarCentroCusto}
                centroCusto={centroCustoSelecionado}
            />
        </div>
    );
}
