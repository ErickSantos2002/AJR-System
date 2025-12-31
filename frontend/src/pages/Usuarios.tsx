import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Users2, UserCheck, UserX, Shield, Mail } from "lucide-react";
import { useUsuarios, useUsuariosMutations } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario";
import UsuarioModal from "../components/UsuarioModal";
import { LoadingSpinner, ErrorMessage } from "../components";
import { showSuccess, showError } from "../lib/toast";
import { useAuth } from "../contexts/AuthContext";

export default function Usuarios() {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [ativoFilter, setAtivoFilter] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios();
    const { criarUsuario, atualizarUsuario, deletarUsuario } = useUsuariosMutations();

    const handleSave = async (data: any) => {
        try {
            if (usuarioEditando) {
                await atualizarUsuario.mutateAsync({ id: usuarioEditando.id, data });
                showSuccess("Usuário atualizado com sucesso!");
            } else {
                await criarUsuario.mutateAsync(data);
                showSuccess("Usuário criado com sucesso!");
            }
            setIsModalOpen(false);
            setUsuarioEditando(null);
        } catch (error: any) {
            showError("Erro ao salvar usuário", error);
            throw error;
        }
    };

    const handleDesativar = async (id: number, nome: string) => {
        if (currentUser?.id === id) {
            showError("Você não pode desativar sua própria conta!");
            return;
        }

        if (!confirm(`Tem certeza que deseja desativar o usuário "${nome}"?`)) return;

        try {
            await deletarUsuario.mutateAsync(id);
            showSuccess("Usuário desativado com sucesso!");
        } catch (error) {
            showError("Erro ao desativar usuário", error);
        }
    };

    const handleEditar = (usuario: Usuario) => {
        setUsuarioEditando(usuario);
        setIsModalOpen(true);
    };

    const handleNovo = () => {
        setUsuarioEditando(null);
        setIsModalOpen(true);
    };

    const filteredUsuarios = usuarios.filter((usuario) => {
        const matchSearch =
            !searchTerm ||
            usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchAtivo =
            ativoFilter === "all" ||
            (ativoFilter === "true" && usuario.ativo) ||
            (ativoFilter === "false" && !usuario.ativo);

        return matchSearch && matchAtivo;
    });

    if (isLoading) return <LoadingSpinner fullScreen text="Carregando usuários..." />;
    if (isError) return <ErrorMessage message="Não foi possível carregar os usuários." error={error as Error} onRetry={refetch} fullScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-cyan-400 text-sm font-medium px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                            Administração
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                        Gestão de Usuários
                    </h1>
                    <p className="text-slate-400">
                        Gerenciamento de usuários e permissões do sistema
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total de Usuários</p>
                            <p className="text-2xl font-bold text-cyan-400">{filteredUsuarios.length}</p>
                        </div>
                        <Users2 className="text-cyan-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Usuários Ativos</p>
                            <p className="text-2xl font-bold text-green-400">
                                {filteredUsuarios.filter((u) => u.ativo).length}
                            </p>
                        </div>
                        <UserCheck className="text-green-400" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Administradores</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {filteredUsuarios.filter((u) => u.is_admin).length}
                            </p>
                        </div>
                        <Shield className="text-yellow-400" size={32} />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                    </div>

                    <select
                        value={ativoFilter}
                        onChange={(e) => setAtivoFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    >
                        <option value="all">Todos</option>
                        <option value="true">Apenas Ativos</option>
                        <option value="false">Apenas Inativos</option>
                    </select>

                    <button
                        onClick={handleNovo}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Novo Usuário
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredUsuarios.map((usuario) => (
                                    <tr
                                        key={usuario.id}
                                        className="hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                                                    {usuario.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {usuario.nome}
                                                        {currentUser?.id === usuario.id && (
                                                            <span className="ml-2 text-xs text-cyan-400">
                                                                (você)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        ID: {usuario.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Mail size={16} className="text-slate-500" />
                                                {usuario.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {usuario.is_admin ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                                                    <Shield size={14} />
                                                    Administrador
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                                                    <Users2 size={14} />
                                                    Usuário
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {usuario.ativo ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                                                    <UserCheck size={14} />
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                                                    <UserX size={14} />
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(usuario)}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Editar usuário"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDesativar(usuario.id, usuario.nome)}
                                                    disabled={currentUser?.id === usuario.id}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={
                                                        currentUser?.id === usuario.id
                                                            ? "Você não pode desativar sua própria conta"
                                                            : "Desativar usuário"
                                                    }
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setUsuarioEditando(null);
                }}
                onSave={handleSave}
                usuario={usuarioEditando}
            />
        </div>
    );
}
