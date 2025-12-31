import { AlertCircle, RefreshCw, XCircle } from "lucide-react";

interface ErrorMessageProps {
    title?: string;
    message: string;
    error?: Error | null;
    onRetry?: () => void;
    fullScreen?: boolean;
    variant?: "error" | "warning";
    className?: string;
}

export default function ErrorMessage({
    title = "Erro ao Carregar Dados",
    message,
    error,
    onRetry,
    fullScreen = false,
    variant = "error",
    className = "",
}: ErrorMessageProps) {
    const colors = {
        error: {
            icon: "text-red-400",
            bg: "bg-red-500/20",
            border: "border-red-500/30",
            button: "from-red-500 to-rose-500",
            buttonShadow: "hover:shadow-red-500/20",
        },
        warning: {
            icon: "text-orange-400",
            bg: "bg-orange-500/20",
            border: "border-orange-500/30",
            button: "from-orange-500 to-yellow-500",
            buttonShadow: "hover:shadow-orange-500/20",
        },
    };

    const Icon = variant === "error" ? XCircle : AlertCircle;
    const colorScheme = colors[variant];

    const content = (
        <div
            className={`bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 max-w-lg w-full text-center ${className}`}
        >
            <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${colorScheme.bg} border ${colorScheme.border} mb-6`}
            >
                <Icon className={colorScheme.icon} size={40} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>

            <p className="text-slate-400 mb-6">{message}</p>

            {error && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs text-red-400 font-mono break-words">
                        {error.message || "Erro desconhecido"}
                    </p>
                </div>
            )}

            {onRetry && (
                <button
                    onClick={onRetry}
                    className={`inline-flex items-center gap-2 bg-gradient-to-r ${colorScheme.button} text-white px-6 py-3 rounded-xl hover:shadow-lg ${colorScheme.buttonShadow} transition-all font-medium`}
                >
                    <RefreshCw size={20} />
                    Tentar Novamente
                </button>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    {content}
                </div>
            </div>
        );
    }

    return content;
}
