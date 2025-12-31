import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Wallet,
    CreditCard,
    AlertCircle,
    Users,
    Truck,
    UserCircle,
    FileText,
    Download,
    FileSpreadsheet,
    RefreshCw,
    Clock,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useDashboard } from "../hooks/useDashboard";
import DashboardSkeleton from "../components/DashboardSkeleton";
import DashboardError from "../components/DashboardError";
import { exportToExcel, exportToPDF } from "../lib/exportUtils";

const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"];

export default function Dashboard() {
    const [period, setPeriod] = useState<string>("");
    const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useDashboard(period);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR");
    };

    const formatLastUpdate = () => {
        if (!dataUpdatedAt) return "";
        const date = new Date(dataUpdatedAt);
        return date.toLocaleString("pt-BR");
    };

    const handleExportExcel = () => {
        if (data) exportToExcel(data);
    };

    const handleExportPDF = () => {
        const element = document.querySelector(".min-h-screen");
        if (element) {
            exportToPDF(element as HTMLElement);
        }
    };

    if (isLoading) return <DashboardSkeleton />;
    if (isError) return <DashboardError error={error} onRetry={refetch} />;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="mb-6 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <span className="text-cyan-400 text-sm font-medium px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                            Sistema de Gestão
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Visão geral financeira e operacional
                    </p>
                </div>
            </div>

            {/* Barra de Ações */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Filtro de Período */}
                        <div className="flex items-center gap-3">
                            <label className="text-slate-400 text-sm font-medium">
                                Período:
                            </label>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">Todos os dados</option>
                                <option value="today">Hoje</option>
                                <option value="week">Esta Semana</option>
                                <option value="month">Este Mês</option>
                                <option value="quarter">Últimos 3 Meses</option>
                                <option value="semester">Últimos 6 Meses</option>
                                <option value="year">Este Ano</option>
                            </select>
                        </div>

                        {/* Botão de Refresh Manual */}
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                        >
                            <RefreshCw size={18} />
                            Atualizar
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Última Atualização */}
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Clock size={16} />
                            <span>Atualizado: {formatLastUpdate()}</span>
                        </div>

                        {/* Botões de Exportação */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleExportExcel}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all font-medium"
                            >
                                <FileSpreadsheet size={18} />
                                Excel
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium"
                            >
                                <Download size={18} />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards Financeiros Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Saldo Disponível */}
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-6 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <TrendingUp className="text-emerald-400" size={20} />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Saldo Disponível</p>
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(data.financeiro.saldo_disponivel)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Caixa + Bancos</p>
                </div>

                {/* A Receber */}
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-6 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                            <DollarSign className="text-white" size={24} />
                        </div>
                        <TrendingUp className="text-blue-400" size={20} />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">A Receber</p>
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(data.financeiro.total_receber)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Clientes</p>
                </div>

                {/* A Pagar */}
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-6 hover:border-red-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500">
                            <CreditCard className="text-white" size={24} />
                        </div>
                        <TrendingDown className="text-red-400" size={20} />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">A Pagar</p>
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(
                            data.financeiro.total_pagar +
                                data.financeiro.salarios_pagar +
                                data.financeiro.impostos_pagar
                        )}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">Total de obrigações</p>
                </div>

                {/* Resultado do Mês */}
                <div
                    className={`bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl border backdrop-blur-xl p-6 transition-all ${
                        data.financeiro.resultado_mes >= 0
                            ? "border-emerald-500/50 hover:border-emerald-500"
                            : "border-red-500/50 hover:border-red-500"
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${
                                data.financeiro.resultado_mes >= 0
                                    ? "from-emerald-500 to-green-500"
                                    : "from-red-500 to-rose-500"
                            }`}
                        >
                            {data.financeiro.resultado_mes >= 0 ? (
                                <TrendingUp className="text-white" size={24} />
                            ) : (
                                <TrendingDown className="text-white" size={24} />
                            )}
                        </div>
                        <AlertCircle
                            className={
                                data.financeiro.resultado_mes >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                            }
                            size={20}
                        />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">Resultado do Mês</p>
                    <p
                        className={`text-3xl font-bold ${
                            data.financeiro.resultado_mes >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                    >
                        {formatCurrency(data.financeiro.resultado_mes)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        {formatCurrency(data.financeiro.receitas_mes)} - {formatCurrency(data.financeiro.despesas_mes)}
                    </p>
                </div>
            </div>

            {/* Totais Operacionais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                            <Users size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Clientes</p>
                            <p className="text-2xl font-bold text-white">{data.totais.clientes}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                            <Truck size={20} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Equipamentos</p>
                            <p className="text-2xl font-bold text-white">{data.totais.equipamentos}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                            <UserCircle size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Motoristas</p>
                            <p className="text-2xl font-bold text-white">{data.totais.motoristas}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                            <FileText size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Lançamentos</p>
                            <p className="text-2xl font-bold text-white">{data.totais.lancamentos}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Receitas por Tipo */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Receitas por Tipo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.graficos.receitas_por_tipo}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ nome, percent }) =>
                                    `${nome}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="valor"
                            >
                                {data.graficos.receitas_por_tipo.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Despesas por Categoria */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">
                        Despesas por Categoria
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.graficos.despesas_por_categoria}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="nome" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                }}
                            />
                            <Bar dataKey="valor" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Evolução Mensal */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Evolução Mensal</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.graficos.evolucao_mensal}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #334155",
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="receitas"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Receitas"
                        />
                        <Line
                            type="monotone"
                            dataKey="despesas"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Despesas"
                        />
                        <Line
                            type="monotone"
                            dataKey="resultado"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Resultado"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Últimos Lançamentos */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Últimos Lançamentos</h3>
                <div className="space-y-3">
                    {data.ultimos_lancamentos.map((lanc) => (
                        <div
                            key={lanc.id}
                            className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                                    <FileText size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {lanc.complemento || "Lançamento #" + lanc.id}
                                    </p>
                                    <p className="text-slate-400 text-sm">{formatDate(lanc.data)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-semibold">{formatCurrency(lanc.valor)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
