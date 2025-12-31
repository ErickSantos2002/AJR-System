import { AlertCircle, RefreshCw } from "lucide-react";

interface PlanoContasErrorProps {
    error: Error;
    onRetry: () => void;
}

export default function PlanoContasError({ error, onRetry }: PlanoContasErrorProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex items-center justify-center">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-12 max-w-md w-full text-center">
                <div className="mb-6">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Erro ao Carregar Plano de Contas
                    </h2>
                    <p className="text-slate-400 mb-4">
                        Não foi possível carregar as contas contábeis
                    </p>
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3 font-mono">
                        {error.message}
                    </p>
                </div>

                <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
                >
                    <RefreshCw className="w-5 h-5" />
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
}
