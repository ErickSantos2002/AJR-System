import { useState, useEffect } from "react";
import { X, Save, Building2, Hash } from "lucide-react";
import type { CentroCusto } from "../types";

interface CentroCustoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<CentroCusto>) => Promise<void>;
    centroCusto?: CentroCusto | null;
}

export default function CentroCustoModal({
    isOpen,
    onClose,
    onSave,
    centroCusto,
}: CentroCustoModalProps) {
    const [codigo, setCodigo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (centroCusto) {
                setCodigo(centroCusto.codigo);
                setDescricao(centroCusto.descricao);
                setAtivo(centroCusto.ativo);
            } else {
                resetForm();
            }
            setErrors({});
        }
    }, [isOpen, centroCusto]);

    const resetForm = () => {
        setCodigo("");
        setDescricao("");
        setAtivo(true);
    };

    const validarFormulario = () => {
        const newErrors: Record<string, string> = {};

        if (!codigo.trim()) {
            newErrors.codigo = "Código é obrigatório";
        }

        if (!descricao.trim()) {
            newErrors.descricao = "Descrição é obrigatória";
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
            const data: Partial<CentroCusto> = {
                codigo: codigo.trim().toUpperCase(),
                descricao: descricao.trim(),
                ativo,
            };

            await onSave(data);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar centro de custo:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Building2 className="text-blue-400" size={28} />
                        {centroCusto ? "Editar Centro de Custo" : "Novo Centro de Custo"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Código */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Código *
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                    placeholder="Ex: ADM, OPE, VEN"
                                    maxLength={20}
                                    disabled={!!centroCusto}
                                    className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                        errors.codigo ? "border-red-500" : "border-slate-600/50"
                                    } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                            </div>
                            {errors.codigo && (
                                <p className="mt-1 text-sm text-red-400">{errors.codigo}</p>
                            )}
                            {centroCusto && (
                                <p className="mt-1 text-xs text-slate-400">
                                    O código não pode ser alterado
                                </p>
                            )}
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Descrição *
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Descrição do centro de custo"
                                    className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                        errors.descricao ? "border-red-500" : "border-slate-600/50"
                                    } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                />
                            </div>
                            {errors.descricao && (
                                <p className="mt-1 text-sm text-red-400">{errors.descricao}</p>
                            )}
                        </div>

                        {/* Status Ativo */}
                        <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl">
                            <input
                                type="checkbox"
                                id="ativo"
                                checked={ativo}
                                onChange={(e) => setAtivo(e.target.checked)}
                                className="w-4 h-4 text-blue-500 focus:ring-blue-500 rounded"
                            />
                            <label htmlFor="ativo" className="text-sm font-medium text-slate-300 cursor-pointer">
                                Centro de custo ativo
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all font-medium disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {isSubmitting ? "Salvando..." : centroCusto ? "Atualizar" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
