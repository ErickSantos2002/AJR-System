import { useEffect, useState } from "react";
import { X, HelpCircle, CheckCircle } from "lucide-react";
import type { PlanoContas } from "../types";

interface PlanoContasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (conta: Partial<PlanoContas>) => Promise<void>;
    conta?: PlanoContas | null;
    contas: PlanoContas[];
}

export default function PlanoContasModal({
    isOpen,
    onClose,
    onSave,
    conta,
    contas,
}: PlanoContasModalProps) {
    const [formData, setFormData] = useState<Partial<PlanoContas>>({
        codigo: "",
        descricao: "",
        tipo: "ATIVO",
        natureza: "DEVEDORA",
        nivel: 1,
        conta_pai_id: undefined,
        aceita_lancamento: true,
        ativo: true,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Função para sugerir próximo código baseado na conta pai
    const sugerirProximoCodigo = (contaPaiId?: number) => {
        if (!contaPaiId) {
            // Conta raiz - sugerir próximo número disponível
            const contasRaiz = contas.filter((c) => c.nivel === 1);
            const ultimoCodigo = contasRaiz.length > 0
                ? Math.max(...contasRaiz.map((c) => parseInt(c.codigo.split(".")[0])))
                : 0;
            return `${ultimoCodigo + 1}`;
        }

        const contaPai = contas.find((c) => c.id === contaPaiId);
        if (!contaPai) return "";

        // Buscar filhas da conta pai
        const filhas = contas.filter((c) => c.conta_pai_id === contaPaiId);

        if (filhas.length === 0) {
            return `${contaPai.codigo}.1`;
        }

        // Encontrar próximo número disponível
        const numeros = filhas.map((c) => {
            const partes = c.codigo.split(".");
            return parseInt(partes[partes.length - 1]);
        });
        const proximoNumero = Math.max(...numeros) + 1;

        return `${contaPai.codigo}.${proximoNumero}`;
    };

    // Calcular nível automaticamente baseado na conta pai
    const calcularNivel = (contaPaiId?: number) => {
        if (!contaPaiId) return 1;
        const contaPai = contas.find((c) => c.id === contaPaiId);
        return contaPai ? contaPai.nivel + 1 : 1;
    };

    // Preencher natureza automaticamente baseado no tipo
    const sugerirNatureza = (tipo: string): "DEVEDORA" | "CREDORA" => {
        if (tipo === "ATIVO" || tipo === "DESPESA") {
            return "DEVEDORA";
        }
        return "CREDORA"; // PASSIVO, RECEITA, PATRIMONIO_LIQUIDO
    };

    useEffect(() => {
        if (conta) {
            setFormData({
                id: conta.id,
                codigo: conta.codigo,
                descricao: conta.descricao,
                tipo: conta.tipo,
                natureza: conta.natureza,
                nivel: conta.nivel,
                conta_pai_id: conta.conta_pai_id,
                aceita_lancamento: conta.aceita_lancamento,
                ativo: conta.ativo,
            });
        } else {
            const codigoSugerido = sugerirProximoCodigo();
            setFormData({
                codigo: codigoSugerido,
                descricao: "",
                tipo: "ATIVO",
                natureza: "DEVEDORA",
                nivel: 1,
                conta_pai_id: undefined,
                aceita_lancamento: true,
                ativo: true,
            });
        }
        setErrors({});
    }, [conta, isOpen]);

    // Atualizar código e nível quando conta pai mudar
    useEffect(() => {
        if (!conta && isOpen) {
            const contaPaiId = formData.conta_pai_id ?? undefined;
            const novoNivel = calcularNivel(contaPaiId);
            const novoCodigo = sugerirProximoCodigo(contaPaiId);
            setFormData((prev) => ({
                ...prev,
                nivel: novoNivel,
                codigo: novoCodigo,
            }));
        }
    }, [formData.conta_pai_id, isOpen, conta]);

    // Atualizar natureza quando tipo mudar
    const handleTipoChange = (novoTipo: PlanoContas["tipo"]) => {
        const novaNatureza = sugerirNatureza(novoTipo);
        setFormData({
            ...formData,
            tipo: novoTipo,
            natureza: novaNatureza,
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validar código
        if (!formData.codigo || formData.codigo.trim() === "") {
            newErrors.codigo = "Código é obrigatório";
        } else if (!/^[0-9.]+$/.test(formData.codigo)) {
            newErrors.codigo = "Código deve conter apenas números e pontos (ex: 1.1.1)";
        } else {
            // Validar formato do código (não pode começar/terminar com ponto, não pode ter pontos duplos)
            if (formData.codigo.startsWith(".") || formData.codigo.endsWith(".")) {
                newErrors.codigo = "Código não pode começar ou terminar com ponto";
            } else if (formData.codigo.includes("..")) {
                newErrors.codigo = "Código não pode ter pontos consecutivos";
            } else {
                // Validar consistência com conta pai
                if (formData.conta_pai_id) {
                    const contaPai = contas.find((c) => c.id === formData.conta_pai_id);
                    if (contaPai) {
                        // O código deve começar com o código da conta pai + ponto
                        if (!formData.codigo.startsWith(contaPai.codigo + ".")) {
                            newErrors.codigo = `Código deve começar com "${contaPai.codigo}." (código da conta pai)`;
                        }
                    }
                }

                // Validar que o nível do código corresponde ao nível calculado
                const partescodigo = formData.codigo.split(".");
                const nivelDoCodigo = partescodigo.length;

                if (nivelDoCodigo !== formData.nivel) {
                    newErrors.codigo = `Código tem ${nivelDoCodigo} ${nivelDoCodigo === 1 ? 'nível' : 'níveis'}, mas deveria ter ${formData.nivel} (baseado na conta pai)`;
                }

                // Verifica se código já existe (apenas ao criar nova conta)
                if (!conta) {
                    const codigoExiste = contas.some((c) => c.codigo === formData.codigo);
                    if (codigoExiste) {
                        newErrors.codigo = "Este código já está sendo usado por outra conta";
                    }
                }
            }
        }

        // Validar descrição
        if (!formData.descricao || formData.descricao.trim() === "") {
            newErrors.descricao = "Nome da conta é obrigatório";
        } else if (formData.descricao.length > 255) {
            newErrors.descricao = "Nome deve ter no máximo 255 caracteres";
        }

        // Validar nível
        if (!formData.nivel || formData.nivel < 1) {
            newErrors.nivel = "Nível deve ser maior ou igual a 1";
        }

        // Validar conta pai se fornecida
        if (formData.conta_pai_id) {
            const contaPai = contas.find((c) => c.id === formData.conta_pai_id);
            if (!contaPai) {
                newErrors.conta_pai_id = "Conta pai não encontrada";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar conta:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">
                        {conta ? "Editar Conta" : "Nova Conta"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!conta && (
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-4">
                            <p className="text-sm text-indigo-200 flex items-start gap-2">
                                <HelpCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>Dica:</strong> Escolha primeiro onde esta conta ficará (Conta Pai).
                                    O sistema vai sugerir automaticamente o código correto para você!
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Conta Pai - PRIMEIRO CAMPO */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            Onde esta conta ficará?
                            <div className="group relative">
                                <HelpCircle size={16} className="text-slate-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 z-10">
                                    Escolha a conta "pai" onde esta nova conta ficará.
                                    Deixe em branco se for uma conta principal (raiz).
                                </div>
                            </div>
                        </label>
                        <select
                            value={formData.conta_pai_id || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    conta_pai_id: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                })
                            }
                            disabled={!!conta}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">📁 Conta Principal (Raiz)</option>
                            {contas
                                .filter((c) => c.id !== conta?.id)
                                .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {"  ".repeat(c.nivel - 1)}
                                        {c.nivel > 1 ? "└─ " : ""}
                                        {c.codigo} - {c.descricao}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Código - AUTO-SUGERIDO */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            Código da Conta
                            {!conta && formData.codigo && !errors.codigo && (
                                <CheckCircle size={16} className="text-green-400" />
                            )}
                            <div className="group relative">
                                <HelpCircle size={16} className="text-slate-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 z-10">
                                    Este código é gerado automaticamente. Você pode alterá-lo se necessário.
                                </div>
                            </div>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.codigo}
                                onChange={(e) =>
                                    setFormData({ ...formData, codigo: e.target.value })
                                }
                                disabled={!!conta}
                                placeholder="Ex: 1.1.1"
                                className={`w-full px-4 py-3 bg-slate-800 border ${
                                    errors.codigo ? "border-red-500" :
                                    formData.codigo && !errors.codigo ? "border-green-500" : "border-slate-600"
                                } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {!conta && (
                                <div className="mt-1 text-xs text-slate-400">
                                    ✨ Sugestão automática baseada na conta pai
                                </div>
                            )}
                        </div>
                        {errors.codigo && (
                            <p className="mt-1 text-sm text-red-400">{errors.codigo}</p>
                        )}
                        {conta && (
                            <p className="mt-1 text-xs text-slate-500">
                                Código não pode ser alterado após criação
                            </p>
                        )}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            Nome da Conta <span className="text-red-400">*</span>
                            {formData.descricao && !errors.descricao && (
                                <CheckCircle size={16} className="text-green-400" />
                            )}
                            <div className="group relative">
                                <HelpCircle size={16} className="text-slate-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 z-10">
                                    Digite o nome que identifica esta conta. Ex: "Caixa", "Banco Itaú", "Fornecedores", etc.
                                </div>
                            </div>
                        </label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) =>
                                setFormData({ ...formData, descricao: e.target.value })
                            }
                            placeholder="Ex: Caixa Geral, Banco Itaú, Clientes, Fornecedores..."
                            rows={2}
                            className={`w-full px-4 py-3 bg-slate-800 border ${
                                errors.descricao ? "border-red-500" :
                                formData.descricao ? "border-green-500" : "border-slate-600"
                            } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
                        />
                        {errors.descricao && (
                            <p className="mt-1 text-sm text-red-400">{errors.descricao}</p>
                        )}
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            Tipo da Conta <span className="text-red-400">*</span>
                            <div className="group relative">
                                <HelpCircle size={16} className="text-slate-400 cursor-help" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-80 p-3 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 z-10">
                                    <strong>ATIVO:</strong> Bens e direitos (Ex: Caixa, Bancos, Contas a Receber)<br/>
                                    <strong>PASSIVO:</strong> Obrigações (Ex: Fornecedores, Salários a Pagar)<br/>
                                    <strong>RECEITA:</strong> Ganhos (Ex: Vendas, Serviços)<br/>
                                    <strong>DESPESA:</strong> Gastos (Ex: Aluguel, Energia, Salários)<br/>
                                    <strong>PATRIMÔNIO LÍQUIDO:</strong> Capital próprio
                                </div>
                            </div>
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => handleTipoChange(e.target.value as PlanoContas["tipo"])}
                            disabled={!!conta}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="ATIVO">💰 ATIVO (Bens e Direitos)</option>
                            <option value="PASSIVO">📋 PASSIVO (Obrigações)</option>
                            <option value="PATRIMONIO_LIQUIDO">🏦 PATRIMÔNIO LÍQUIDO (Capital Próprio)</option>
                            <option value="RECEITA">📈 RECEITA (Ganhos)</option>
                            <option value="DESPESA">📉 DESPESA (Gastos)</option>
                        </select>
                        {!conta && (
                            <div className="mt-1 text-xs text-slate-400">
                                ✨ A natureza será preenchida automaticamente
                            </div>
                        )}
                    </div>

                    {/* Natureza - Oculto e automático para novos registros */}
                    {conta && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                Natureza
                            </label>
                            <select
                                value={formData.natureza}
                                disabled={true}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white opacity-50 cursor-not-allowed"
                            >
                                <option value="DEVEDORA">DEVEDORA</option>
                                <option value="CREDORA">CREDORA</option>
                            </select>
                            <p className="mt-1 text-xs text-slate-500">
                                Natureza não pode ser alterada
                            </p>
                        </div>
                    )}

                    {/* Nível - Mostrado apenas como informação (read-only) */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">Nível Hierárquico:</span>
                                <span className="text-lg font-semibold text-indigo-400">{formData.nivel}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                {formData.nivel === 1 && "Conta Principal"}
                                {formData.nivel === 2 && "Subconta de Nível 2"}
                                {formData.nivel === 3 && "Subconta de Nível 3"}
                                {formData.nivel === 4 && "Subconta de Nível 4"}
                                {formData.nivel && formData.nivel >= 5 && "Subconta de Nível 5+"}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            ✨ Calculado automaticamente baseado na conta pai
                        </p>
                    </div>

                    {/* Checkboxes com explicações */}
                    <div className="space-y-4 pt-2 border-t border-slate-700/50">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.aceita_lancamento}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        aceita_lancamento: e.target.checked,
                                    })
                                }
                                className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                        Esta conta pode receber lançamentos
                                    </span>
                                    <div className="group/help relative">
                                        <HelpCircle size={14} className="text-slate-400 cursor-help" />
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/help:block w-64 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 z-10">
                                            Marque esta opção se você vai registrar movimentações financeiras nesta conta.
                                            Deixe desmarcado se for apenas uma categoria organizacional.
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Contas que recebem lançamentos são chamadas de "analíticas"
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.ativo}
                                onChange={(e) =>
                                    setFormData({ ...formData, ativo: e.target.checked })
                                }
                                className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                        Conta ativa no sistema
                                    </span>
                                    <div className="group/help relative">
                                        <HelpCircle size={14} className="text-slate-400 cursor-help" />
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/help:block w-64 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 z-10">
                                            Contas inativas não aparecem na listagem principal e não podem receber novos lançamentos.
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Desmarque apenas se quiser desativar esta conta
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
