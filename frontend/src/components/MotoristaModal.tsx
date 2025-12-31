import { useState, useEffect } from "react";
import { X, Save, User, FileText, Phone, MapPin, Calendar, CreditCard, BadgeCheck } from "lucide-react";
import type { Motorista } from "../types";
import { validarCPF } from "../lib/validators";
import { mascaraCPF, mascaraTelefone, mascaraCNH, removerMascara } from "../lib/masks";

interface MotoristaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Motorista>) => Promise<void>;
    motorista?: Motorista | null;
}

const CATEGORIAS_CNH = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

export default function MotoristaModal({
    isOpen,
    onClose,
    onSave,
    motorista,
}: MotoristaModalProps) {
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [cnh, setCnh] = useState("");
    const [categoriaCnh, setCategoriaCnh] = useState("B");
    const [validadeCnh, setValidadeCnh] = useState("");
    const [telefone, setTelefone] = useState("");
    const [endereco, setEndereco] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [dataAdmissao, setDataAdmissao] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (motorista) {
                setNome(motorista.nome);
                setCpf(mascaraCPF(motorista.cpf));
                setCnh(motorista.cnh);
                setCategoriaCnh(motorista.categoria_cnh);
                setValidadeCnh(motorista.validade_cnh.split("T")[0]);
                setTelefone(motorista.telefone ? mascaraTelefone(motorista.telefone) : "");
                setEndereco(motorista.endereco || "");
                setDataNascimento(motorista.data_nascimento ? motorista.data_nascimento.split("T")[0] : "");
                setDataAdmissao(motorista.data_admissao ? motorista.data_admissao.split("T")[0] : "");
                setAtivo(motorista.ativo);
            } else {
                resetForm();
            }
            setErrors({});
        }
    }, [isOpen, motorista]);

    const resetForm = () => {
        setNome("");
        setCpf("");
        setCnh("");
        setCategoriaCnh("B");
        setValidadeCnh("");
        setTelefone("");
        setEndereco("");
        setDataNascimento("");
        setDataAdmissao("");
        setAtivo(true);
    };

    const validarFormulario = () => {
        const newErrors: Record<string, string> = {};

        if (!nome.trim()) {
            newErrors.nome = "Nome é obrigatório";
        }

        const cpfLimpo = removerMascara(cpf);
        if (!cpfLimpo) {
            newErrors.cpf = "CPF é obrigatório";
        } else if (!validarCPF(cpfLimpo)) {
            newErrors.cpf = "CPF inválido";
        }

        if (!cnh.trim()) {
            newErrors.cnh = "CNH é obrigatória";
        } else if (cnh.length !== 11) {
            newErrors.cnh = "CNH deve ter 11 dígitos";
        }

        if (!validadeCnh) {
            newErrors.validadeCnh = "Validade da CNH é obrigatória";
        } else {
            const dataValidade = new Date(validadeCnh);
            const hoje = new Date();
            if (dataValidade < hoje) {
                newErrors.validadeCnh = "CNH vencida";
            }
        }

        if (dataNascimento) {
            const nascimento = new Date(dataNascimento);
            const hoje = new Date();
            const idade = hoje.getFullYear() - nascimento.getFullYear();
            if (idade < 18) {
                newErrors.dataNascimento = "Motorista deve ter pelo menos 18 anos";
            } else if (idade > 100) {
                newErrors.dataNascimento = "Data de nascimento inválida";
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
            const data: Partial<Motorista> = {
                nome: nome.trim(),
                cpf: removerMascara(cpf),
                cnh: cnh.trim(),
                categoria_cnh: categoriaCnh,
                validade_cnh: validadeCnh,
                telefone: telefone ? removerMascara(telefone) : null,
                endereco: endereco.trim() || null,
                data_nascimento: dataNascimento || null,
                data_admissao: dataAdmissao || null,
                ativo,
            };

            await onSave(data);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar motorista:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Verificar se CNH está próxima de vencer (30 dias)
    const cnhProximaVencer = validadeCnh && new Date(validadeCnh) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <User className="text-purple-400" size={28} />
                        {motorista ? "Editar Motorista" : "Novo Motorista"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nome Completo *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome completo do motorista"
                                    className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                        errors.nome ? "border-red-500" : "border-slate-600/50"
                                    } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                />
                            </div>
                            {errors.nome && (
                                <p className="mt-1 text-sm text-red-400">{errors.nome}</p>
                            )}
                        </div>

                        {/* CPF e Telefone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    CPF *
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={cpf}
                                        onChange={(e) => setCpf(mascaraCPF(e.target.value))}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.cpf ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.cpf && (
                                    <p className="mt-1 text-sm text-red-400">{errors.cpf}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Telefone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={telefone}
                                        onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CNH, Categoria e Validade */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    CNH *
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={cnh}
                                        onChange={(e) => setCnh(mascaraCNH(e.target.value))}
                                        placeholder="00000000000"
                                        maxLength={11}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.cnh ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.cnh && (
                                    <p className="mt-1 text-sm text-red-400">{errors.cnh}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Categoria *
                                </label>
                                <div className="relative">
                                    <BadgeCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <select
                                        value={categoriaCnh}
                                        onChange={(e) => setCategoriaCnh(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    >
                                        {CATEGORIAS_CNH.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Validade CNH *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="date"
                                        value={validadeCnh}
                                        onChange={(e) => setValidadeCnh(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.validadeCnh ? "border-red-500" : cnhProximaVencer ? "border-orange-500" : "border-slate-600/50"
                                        } rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.validadeCnh && (
                                    <p className="mt-1 text-sm text-red-400">{errors.validadeCnh}</p>
                                )}
                                {cnhProximaVencer && !errors.validadeCnh && (
                                    <p className="mt-1 text-sm text-orange-400">⚠️ CNH próxima de vencer</p>
                                )}
                            </div>
                        </div>

                        {/* Data de Nascimento e Data de Admissão */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Data de Nascimento
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="date"
                                        value={dataNascimento}
                                        onChange={(e) => setDataNascimento(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.dataNascimento ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.dataNascimento && (
                                    <p className="mt-1 text-sm text-red-400">{errors.dataNascimento}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Data de Admissão
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="date"
                                        value={dataAdmissao}
                                        onChange={(e) => setDataAdmissao(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Endereço
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={endereco}
                                    onChange={(e) => setEndereco(e.target.value)}
                                    placeholder="Rua, número, bairro, cidade"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Status Ativo */}
                        <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl">
                            <input
                                type="checkbox"
                                id="ativo"
                                checked={ativo}
                                onChange={(e) => setAtivo(e.target.checked)}
                                className="w-4 h-4 text-purple-500 focus:ring-purple-500 rounded"
                            />
                            <label htmlFor="ativo" className="text-sm font-medium text-slate-300 cursor-pointer">
                                Motorista ativo
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
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {isSubmitting ? "Salvando..." : motorista ? "Atualizar" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
