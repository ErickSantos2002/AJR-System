import { useState, useEffect } from "react";
import { X, Save, User, FileText, Mail, Phone, MapPin, Building } from "lucide-react";
import type { Cliente } from "../types";
import { validarCPF, validarCNPJ, validarEmail } from "../lib/validators";
import { mascaraCPF, mascaraCNPJ, mascaraTelefone, mascaraCEP, removerMascara } from "../lib/masks";

interface ClienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Cliente>) => Promise<void>;
    cliente?: Cliente | null;
}

export default function ClienteModal({
    isOpen,
    onClose,
    onSave,
    cliente,
}: ClienteModalProps) {
    const [nome, setNome] = useState("");
    const [tipoPessoa, setTipoPessoa] = useState<"F" | "J">("F");
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [endereco, setEndereco] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [cep, setCep] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (cliente) {
                setNome(cliente.nome);
                setTipoPessoa(cliente.tipo_pessoa);
                // Aplicar máscara ao carregar
                const cpfCnpjLimpo = cliente.cpf_cnpj;
                setCpfCnpj(cliente.tipo_pessoa === "F" ? mascaraCPF(cpfCnpjLimpo) : mascaraCNPJ(cpfCnpjLimpo));
                setTelefone(cliente.telefone ? mascaraTelefone(cliente.telefone) : "");
                setEmail(cliente.email || "");
                setEndereco(cliente.endereco || "");
                setCidade(cliente.cidade || "");
                setEstado(cliente.estado || "");
                setCep(cliente.cep ? mascaraCEP(cliente.cep) : "");
                setAtivo(cliente.ativo);
            } else {
                resetForm();
            }
            setErrors({});
        }
    }, [isOpen, cliente]);

    const resetForm = () => {
        setNome("");
        setTipoPessoa("F");
        setCpfCnpj("");
        setTelefone("");
        setEmail("");
        setEndereco("");
        setCidade("");
        setEstado("");
        setCep("");
        setAtivo(true);
    };

    const handleCpfCnpjChange = (value: string) => {
        if (tipoPessoa === "F") {
            setCpfCnpj(mascaraCPF(value));
        } else {
            setCpfCnpj(mascaraCNPJ(value));
        }
    };

    const handleTipoPessoaChange = (tipo: "F" | "J") => {
        setTipoPessoa(tipo);
        setCpfCnpj(""); // Limpar CPF/CNPJ ao mudar o tipo
    };

    const validarFormulario = () => {
        const newErrors: Record<string, string> = {};

        if (!nome.trim()) {
            newErrors.nome = "Nome é obrigatório";
        }

        const cpfCnpjLimpo = removerMascara(cpfCnpj);

        if (!cpfCnpjLimpo) {
            newErrors.cpf_cnpj = tipoPessoa === "F" ? "CPF é obrigatório" : "CNPJ é obrigatório";
        } else if (tipoPessoa === "F" && !validarCPF(cpfCnpjLimpo)) {
            newErrors.cpf_cnpj = "CPF inválido";
        } else if (tipoPessoa === "J" && !validarCNPJ(cpfCnpjLimpo)) {
            newErrors.cpf_cnpj = "CNPJ inválido";
        }

        if (email && !validarEmail(email)) {
            newErrors.email = "Email inválido";
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
            const data: Partial<Cliente> = {
                nome: nome.trim(),
                tipo_pessoa: tipoPessoa,
                cpf_cnpj: removerMascara(cpfCnpj),
                telefone: telefone ? removerMascara(telefone) : null,
                email: email.trim() || null,
                endereco: endereco.trim() || null,
                cidade: cidade.trim() || null,
                estado: estado.trim() || null,
                cep: cep ? removerMascara(cep) : null,
                ativo,
            };

            await onSave(data);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
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
                className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <User className="text-cyan-400" size={28} />
                        {cliente ? "Editar Cliente" : "Novo Cliente"}
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
                        {/* Tipo de Pessoa */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tipo de Pessoa *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="F"
                                        checked={tipoPessoa === "F"}
                                        onChange={() => handleTipoPessoaChange("F")}
                                        className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="text-slate-300">Pessoa Física</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="J"
                                        checked={tipoPessoa === "J"}
                                        onChange={() => handleTipoPessoaChange("J")}
                                        className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="text-slate-300">Pessoa Jurídica</span>
                                </label>
                            </div>
                        </div>

                        {/* Nome e CPF/CNPJ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nome {tipoPessoa === "J" && "/ Razão Social"} *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder={tipoPessoa === "F" ? "Nome completo" : "Razão social"}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.nome ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.nome && (
                                    <p className="mt-1 text-sm text-red-400">{errors.nome}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {tipoPessoa === "F" ? "CPF" : "CNPJ"} *
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={cpfCnpj}
                                        onChange={(e) => handleCpfCnpjChange(e.target.value)}
                                        placeholder={tipoPessoa === "F" ? "000.000.000-00" : "00.000.000/0000-00"}
                                        maxLength={tipoPessoa === "F" ? 14 : 18}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.cpf_cnpj ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.cpf_cnpj && (
                                    <p className="mt-1 text-sm text-red-400">{errors.cpf_cnpj}</p>
                                )}
                            </div>
                        </div>

                        {/* Telefone e Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@exemplo.com"
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.email ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                                )}
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
                                    placeholder="Rua, número, complemento"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Cidade, Estado e CEP */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Cidade
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="Cidade"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="AC">AC</option>
                                    <option value="AL">AL</option>
                                    <option value="AP">AP</option>
                                    <option value="AM">AM</option>
                                    <option value="BA">BA</option>
                                    <option value="CE">CE</option>
                                    <option value="DF">DF</option>
                                    <option value="ES">ES</option>
                                    <option value="GO">GO</option>
                                    <option value="MA">MA</option>
                                    <option value="MT">MT</option>
                                    <option value="MS">MS</option>
                                    <option value="MG">MG</option>
                                    <option value="PA">PA</option>
                                    <option value="PB">PB</option>
                                    <option value="PR">PR</option>
                                    <option value="PE">PE</option>
                                    <option value="PI">PI</option>
                                    <option value="RJ">RJ</option>
                                    <option value="RN">RN</option>
                                    <option value="RS">RS</option>
                                    <option value="RO">RO</option>
                                    <option value="RR">RR</option>
                                    <option value="SC">SC</option>
                                    <option value="SP">SP</option>
                                    <option value="SE">SE</option>
                                    <option value="TO">TO</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    CEP
                                </label>
                                <input
                                    type="text"
                                    value={cep}
                                    onChange={(e) => setCep(mascaraCEP(e.target.value))}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                                className="w-4 h-4 text-cyan-500 focus:ring-cyan-500 rounded"
                            />
                            <label htmlFor="ativo" className="text-sm font-medium text-slate-300 cursor-pointer">
                                Cliente ativo
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
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {isSubmitting ? "Salvando..." : cliente ? "Atualizar" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
