import { useEffect, useState } from "react";
import { Search, Plus, BookOpen, Building2 } from "lucide-react";
import api from "../api/axios";
import type { Historico, CentroCusto } from "../types";

type Tab = "historicos" | "centros-custo";

export default function Configuracoes() {
    const [activeTab, setActiveTab] = useState<Tab>("historicos");
    const [historicos, setHistoricos] = useState<Historico[]>([]);
    const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [historicosRes, centrosRes] = await Promise.all([
                api.get("/historicos/"),
                api.get("/centros-custo/"),
            ]);
            setHistoricos(historicosRes.data);
            setCentrosCusto(centrosRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistoricos = historicos.filter((hist) =>
        hist.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hist.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCentrosCusto = centrosCusto.filter((cc) =>
        cc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cc.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="text-slate-400">Carregando...</div>
            </div>
        );
    }

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
                            setSearchTerm("");
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
                            setSearchTerm("");
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

            {/* Actions Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
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
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button className="ml-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center font-medium">
                        <Plus size={20} className="mr-2" />
                        {activeTab === "historicos" ? "Novo Histórico" : "Novo Centro de Custo"}
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === "historicos" ? (
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredHistoricos.map((historico) => (
                                    <tr
                                        key={historico.id}
                                        className="hover:bg-slate-800/30 cursor-pointer transition-colors"
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
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    historico.ativo
                                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                                                }`}
                                            >
                                                {historico.ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredHistoricos.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                Nenhum histórico encontrado
                            </div>
                        )}
                    </div>
                </div>
            ) : (
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredCentrosCusto.map((centroCusto) => (
                                    <tr
                                        key={centroCusto.id}
                                        className="hover:bg-slate-800/30 cursor-pointer transition-colors"
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
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    centroCusto.ativo
                                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                                                }`}
                                            >
                                                {centroCusto.ativo ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredCentrosCusto.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                Nenhum centro de custo encontrado
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    Total:{" "}
                    <span className="text-white font-medium">
                        {activeTab === "historicos"
                            ? filteredHistoricos.length
                            : filteredCentrosCusto.length}
                    </span>{" "}
                    {activeTab === "historicos" ? "histórico(s)" : "centro(s) de custo"}
                </div>
            </div>
        </div>
    );
}
