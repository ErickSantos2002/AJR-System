import { useState, useEffect } from "react";
import { X, Save, User, Mail, Lock, Shield, ShieldOff } from "lucide-react";
import type { Usuario } from "../types/usuario";
import { validarEmail } from "../lib/validators";

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    usuario?: Usuario | null;
}

export default function UsuarioModal({
    isOpen,
    onClose,
    onSave,
    usuario,
}: UsuarioModalProps) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [ativo, setAtivo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (usuario) {
                setNome(usuario.nome);
                setEmail(usuario.email);
                setSenha("");
                setConfirmarSenha("");
                setIsAdmin(usuario.is_admin);
                setAtivo(usuario.ativo);
            } else {
                resetForm();
            }
            setErrors({});
        }
    }, [isOpen, usuario]);

    const resetForm = () => {
        setNome("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
        setIsAdmin(false);
        setAtivo(true);
    };

    const validarFormulario = () => {
        const newErrors: Record<string, string> = {};

        if (!nome.trim()) {
            newErrors.nome = "Nome é obrigatório";
        }

        if (!email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!validarEmail(email)) {
            newErrors.email = "Email inválido";
        }

        // Senha obrigatória apenas para novos usuários
        if (!usuario) {
            if (!senha) {
                newErrors.senha = "Senha é obrigatória";
            } else if (senha.length < 6) {
                newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
            }

            if (senha !== confirmarSenha) {
                newErrors.confirmarSenha = "As senhas não coincidem";
            }
        } else {
            // Para edição, senha é opcional
            if (senha) {
                if (senha.length < 6) {
                    newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
                }

                if (senha !== confirmarSenha) {
                    newErrors.confirmarSenha = "As senhas não coincidem";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const data: any = {
                nome,
                email,
                is_admin: isAdmin,
            };

            // Incluir senha apenas se foi preenchida
            if (senha) {
                data.senha = senha;
            }

            // Incluir ativo apenas para edição
            if (usuario) {
                data.ativo = ativo;
            }

            await onSave(data);
            onClose();
            resetForm();
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <User size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {usuario ? "Editar Usuário" : "Novo Usuário"}
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">
                                {usuario
                                    ? "Atualize as informações do usuário"
                                    : "Preencha os dados para criar um novo usuário"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <User size={16} className="inline mr-2" />
                            Nome Completo <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite o nome completo"
                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                                errors.nome
                                    ? "border-red-500 focus:ring-red-500/50"
                                    : "border-slate-700 focus:ring-blue-500/50"
                            }`}
                        />
                        {errors.nome && (
                            <p className="text-red-400 text-sm mt-1">{errors.nome}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Mail size={16} className="inline mr-2" />
                            Email <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@exemplo.com"
                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                                errors.email
                                    ? "border-red-500 focus:ring-red-500/50"
                                    : "border-slate-700 focus:ring-blue-500/50"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Senha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <Lock size={16} className="inline mr-2" />
                                Senha {!usuario && <span className="text-red-400">*</span>}
                                {usuario && <span className="text-slate-500 text-xs">(deixe em branco para manter)</span>}
                            </label>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                                    errors.senha
                                        ? "border-red-500 focus:ring-red-500/50"
                                        : "border-slate-700 focus:ring-blue-500/50"
                                }`}
                            />
                            {errors.senha && (
                                <p className="text-red-400 text-sm mt-1">{errors.senha}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <Lock size={16} className="inline mr-2" />
                                Confirmar Senha {!usuario && <span className="text-red-400">*</span>}
                            </label>
                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                                    errors.confirmarSenha
                                        ? "border-red-500 focus:ring-red-500/50"
                                        : "border-slate-700 focus:ring-blue-500/50"
                                }`}
                            />
                            {errors.confirmarSenha && (
                                <p className="text-red-400 text-sm mt-1">
                                    {errors.confirmarSenha}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Permissões e Status */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 space-y-3">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">
                            Permissões e Status
                        </h3>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                                {isAdmin ? (
                                    <Shield size={18} className="text-yellow-400" />
                                ) : (
                                    <ShieldOff size={18} className="text-slate-500" />
                                )}
                                <span className="text-sm text-slate-300">
                                    Administrador
                                </span>
                            </div>
                        </label>

                        {usuario && (
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={ativo}
                                    onChange={(e) => setAtivo(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-2 focus:ring-green-500/50 cursor-pointer"
                                />
                                <span className="text-sm text-slate-300 group-hover:text-green-400 transition-colors">
                                    Usuário Ativo
                                </span>
                            </label>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-all font-medium"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {isSubmitting
                                ? "Salvando..."
                                : usuario
                                ? "Atualizar"
                                : "Criar Usuário"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
