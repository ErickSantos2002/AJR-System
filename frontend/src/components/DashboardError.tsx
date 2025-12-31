import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
    error: Error | null;
    onRetry: () => void;
}

export default function DashboardError({ error, onRetry }: DashboardErrorProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 max-w-lg w-full text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                        <AlertCircle className="text-red-400" size={40} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3">
                        Erro ao Carregar Dashboard
                    </h2>

                    <p className="text-slate-400 mb-6">
                        Não foi possível carregar os dados do dashboard. Verifique sua conexão e
                        tente novamente.
                    </p>

                    {error && (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6 text-left">
                            <p className="text-xs text-red-400 font-mono">
                                {error.message || "Erro desconhecido"}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium"
                    >
                        <RefreshCw size={20} />
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
}
