import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import api from "../api/axios";
import type { Equipamento } from "../types";

export default function Equipamentos() {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEquipamentos();
    }, []);

    const fetchEquipamentos = async () => {
        try {
            const response = await api.get("/equipamentos/");
            setEquipamentos(response.data);
        } catch (error) {
            console.error("Erro ao carregar equipamentos:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEquipamentos = equipamentos.filter((equip) =>
        equip.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equip.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equip.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTipoLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            CAMINHAO: "Caminhão",
            RETROESCAVADEIRA: "Retroescavadeira",
            ESCAVADEIRA: "Escavadeira",
            TRATOR: "Trator",
            PA_CARREGADEIRA: "Pá Carregadeira",
            ROLO_COMPACTADOR: "Rolo Compactador",
            OUTRO: "Outro",
        };
        return labels[tipo] || tipo;
    };

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
                            placeholder="Buscar por identificador, marca ou modelo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button className="ml-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center font-medium">
                        <Plus size={20} className="mr-2" />
                        Novo Equipamento
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
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
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredEquipamentos.map((equip) => (
                                <tr
                                    key={equip.id}
                                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {equip.identificador}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            {getTipoLabel(equip.tipo)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {equip.marca} {equip.modelo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {equip.placa || "-"}
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

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    Total: <span className="text-white font-medium">{filteredEquipamentos.length}</span> equipamento(s)
                </div>
            </div>
        </div>
    );
}
