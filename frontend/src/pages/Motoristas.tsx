import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import api from "../api/axios";
import type { Motorista } from "../types";

export default function Motoristas() {
    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchMotoristas();
    }, []);

    const fetchMotoristas = async () => {
        try {
            const response = await api.get("/motoristas/");
            setMotoristas(response.data);
        } catch (error) {
            console.error("Erro ao carregar motoristas:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMotoristas = motoristas.filter((motorista) =>
        motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        motorista.cpf.includes(searchTerm) ||
        motorista.cnh.includes(searchTerm)
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR");
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
                            placeholder="Buscar por nome, CPF ou CNH..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button className="ml-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center font-medium">
                        <Plus size={20} className="mr-2" />
                        Novo Motorista
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
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredMotoristas.map((motorista) => (
                                <tr
                                    key={motorista.id}
                                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">
                                            {motorista.nome}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-400">
                                            {motorista.cpf}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {formatDate(motorista.validade_cnh)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                motorista.ativo
                                                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                                            }`}
                                        >
                                            {motorista.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredMotoristas.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            Nenhum motorista encontrado
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                    Total: <span className="text-white font-medium">{filteredMotoristas.length}</span> motorista(s)
                </div>
            </div>
        </div>
    );
}
