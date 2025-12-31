import { useState, useEffect } from "react";
import { X, Save, Truck, Hash, Calendar, DollarSign, Gauge, FileText } from "lucide-react";
import type { Equipamento } from "../types";
import { mascaraPlaca } from "../lib/masks";

interface EquipamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Equipamento>) => Promise<void>;
    equipamento?: Equipamento | null;
}

const TIPOS_EQUIPAMENTO = [
    { value: "CAMINHAO", label: "Caminhão" },
    { value: "RETROESCAVADEIRA", label: "Retroescavadeira" },
    { value: "TRATOR", label: "Trator" },
    { value: "ESCAVADEIRA", label: "Escavadeira" },
    { value: "PA_CARREGADEIRA", label: "Pá Carregadeira" },
    { value: "ROLO_COMPACTADOR", label: "Rolo Compactador" },
    { value: "OUTRO", label: "Outro" },
];

export default function EquipamentoModal({
    isOpen,
    onClose,
    onSave,
    equipamento,
}: EquipamentoModalProps) {
    const [tipo, setTipo] = useState<Equipamento["tipo"]>("CAMINHAO");
    const [identificador, setIdentificador] = useState("");
    const [placa, setPlaca] = useState("");
    const [modelo, setModelo] = useState("");
    const [marca, setMarca] = useState("");
    const [anoFabricacao, setAnoFabricacao] = useState("");
    const [numeroSerie, setNumeroSerie] = useState("");
    const [valorAquisicao, setValorAquisicao] = useState("");
    const [hodometroInicial, setHodometroInicial] = useState("");
    const [hodometroAtual, setHodometroAtual] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (equipamento) {
                setTipo(equipamento.tipo);
                setIdentificador(equipamento.identificador);
                setPlaca(equipamento.placa ? mascaraPlaca(equipamento.placa) : "");
                setModelo(equipamento.modelo);
                setMarca(equipamento.marca);
                setAnoFabricacao(equipamento.ano_fabricacao?.toString() || "");
                setNumeroSerie(equipamento.numero_serie || "");
                setValorAquisicao(equipamento.valor_aquisicao?.toString() || "");
                setHodometroInicial(equipamento.hodometro_inicial?.toString() || "");
                setHodometroAtual(equipamento.hodometro_atual?.toString() || "");
                setObservacoes(equipamento.observacoes || "");
                setAtivo(equipamento.ativo);
            } else {
                resetForm();
            }
            setErrors({});
        }
    }, [isOpen, equipamento]);

    const resetForm = () => {
        setTipo("CAMINHAO");
        setIdentificador("");
        setPlaca("");
        setModelo("");
        setMarca("");
        setAnoFabricacao("");
        setNumeroSerie("");
        setValorAquisicao("");
        setHodometroInicial("");
        setHodometroAtual("");
        setObservacoes("");
        setAtivo(true);
    };

    const validarFormulario = () => {
        const newErrors: Record<string, string> = {};

        if (!identificador.trim()) {
            newErrors.identificador = "Identificador é obrigatório";
        }

        if (!modelo.trim()) {
            newErrors.modelo = "Modelo é obrigatório";
        }

        if (!marca.trim()) {
            newErrors.marca = "Marca é obrigatória";
        }

        const anoAtual = new Date().getFullYear();
        if (anoFabricacao && (parseInt(anoFabricacao) < 1900 || parseInt(anoFabricacao) > anoAtual + 1)) {
            newErrors.anoFabricacao = `Ano deve estar entre 1900 e ${anoAtual + 1}`;
        }

        if (hodometroAtual && hodometroInicial && parseFloat(hodometroAtual) < parseFloat(hodometroInicial)) {
            newErrors.hodometroAtual = "Hodômetro atual não pode ser menor que o inicial";
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
            const data: Partial<Equipamento> = {
                tipo,
                identificador: identificador.trim(),
                placa: placa ? placa.replace(/[^A-Z0-9]/g, "") : null,
                modelo: modelo.trim(),
                marca: marca.trim(),
                ano_fabricacao: anoFabricacao ? parseInt(anoFabricacao) : null,
                numero_serie: numeroSerie.trim() || null,
                valor_aquisicao: valorAquisicao ? parseFloat(valorAquisicao) : null,
                hodometro_inicial: hodometroInicial ? parseFloat(hodometroInicial) : null,
                hodometro_atual: hodometroAtual ? parseFloat(hodometroAtual) : null,
                observacoes: observacoes.trim() || null,
                ativo,
            };

            await onSave(data);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar equipamento:", error);
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
                className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Truck className="text-cyan-400" size={28} />
                        {equipamento ? "Editar Equipamento" : "Novo Equipamento"}
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
                        {/* Tipo e Identificador */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Tipo de Equipamento *
                                </label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value as Equipamento["tipo"])}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                >
                                    {TIPOS_EQUIPAMENTO.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Identificador *
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={identificador}
                                        onChange={(e) => setIdentificador(e.target.value)}
                                        placeholder="Ex: CAM-001, RETRO-01"
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.identificador ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.identificador && (
                                    <p className="mt-1 text-sm text-red-400">{errors.identificador}</p>
                                )}
                            </div>
                        </div>

                        {/* Marca, Modelo e Placa */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Marca *
                                </label>
                                <input
                                    type="text"
                                    value={marca}
                                    onChange={(e) => setMarca(e.target.value)}
                                    placeholder="Ex: Caterpillar, Volvo"
                                    className={`w-full px-4 py-3 bg-slate-800/50 border ${
                                        errors.marca ? "border-red-500" : "border-slate-600/50"
                                    } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                />
                                {errors.marca && (
                                    <p className="mt-1 text-sm text-red-400">{errors.marca}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Modelo *
                                </label>
                                <input
                                    type="text"
                                    value={modelo}
                                    onChange={(e) => setModelo(e.target.value)}
                                    placeholder="Ex: 320D, FH16"
                                    className={`w-full px-4 py-3 bg-slate-800/50 border ${
                                        errors.modelo ? "border-red-500" : "border-slate-600/50"
                                    } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                />
                                {errors.modelo && (
                                    <p className="mt-1 text-sm text-red-400">{errors.modelo}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Placa
                                </label>
                                <input
                                    type="text"
                                    value={placa}
                                    onChange={(e) => setPlaca(mascaraPlaca(e.target.value))}
                                    placeholder="AAA-0000"
                                    maxLength={8}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all uppercase"
                                />
                            </div>
                        </div>

                        {/* Ano e Número de Série */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Ano de Fabricação
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="number"
                                        value={anoFabricacao}
                                        onChange={(e) => setAnoFabricacao(e.target.value)}
                                        placeholder="2020"
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.anoFabricacao ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.anoFabricacao && (
                                    <p className="mt-1 text-sm text-red-400">{errors.anoFabricacao}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Número de Série
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={numeroSerie}
                                        onChange={(e) => setNumeroSerie(e.target.value)}
                                        placeholder="Número de série do chassi"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Valor de Aquisição */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Valor de Aquisição
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valorAquisicao}
                                    onChange={(e) => setValorAquisicao(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Hodômetro Inicial e Atual */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Hodômetro Inicial (horas)
                                </label>
                                <div className="relative">
                                    <Gauge className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={hodometroInicial}
                                        onChange={(e) => setHodometroInicial(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Hodômetro Atual (horas)
                                </label>
                                <div className="relative">
                                    <Gauge className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={hodometroAtual}
                                        onChange={(e) => setHodometroAtual(e.target.value)}
                                        placeholder="0.0"
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-800/50 border ${
                                            errors.hodometroAtual ? "border-red-500" : "border-slate-600/50"
                                        } rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all`}
                                    />
                                </div>
                                {errors.hodometroAtual && (
                                    <p className="mt-1 text-sm text-red-400">{errors.hodometroAtual}</p>
                                )}
                            </div>
                        </div>

                        {/* Observações */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Observações
                            </label>
                            <textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                rows={3}
                                placeholder="Informações adicionais sobre o equipamento..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                            />
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
                                Equipamento ativo
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
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {isSubmitting ? "Salvando..." : equipamento ? "Atualizar" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
