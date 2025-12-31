import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info" | "success";
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    isLoading = false,
}: ConfirmDialogProps) {
    const variants = {
        danger: {
            icon: AlertCircle,
            iconColor: "text-red-400",
            iconBg: "bg-red-500/20",
            iconBorder: "border-red-500/30",
            confirmButton: "from-red-500 to-rose-500",
            confirmButtonShadow: "hover:shadow-red-500/20",
        },
        warning: {
            icon: AlertTriangle,
            iconColor: "text-orange-400",
            iconBg: "bg-orange-500/20",
            iconBorder: "border-orange-500/30",
            confirmButton: "from-orange-500 to-yellow-500",
            confirmButtonShadow: "hover:shadow-orange-500/20",
        },
        info: {
            icon: Info,
            iconColor: "text-blue-400",
            iconBg: "bg-blue-500/20",
            iconBorder: "border-blue-500/30",
            confirmButton: "from-blue-500 to-cyan-500",
            confirmButtonShadow: "hover:shadow-blue-500/20",
        },
        success: {
            icon: CheckCircle,
            iconColor: "text-green-400",
            iconBg: "bg-green-500/20",
            iconBorder: "border-green-500/30",
            confirmButton: "from-green-500 to-emerald-500",
            confirmButtonShadow: "hover:shadow-green-500/20",
        },
    };

    const config = variants[variant];
    const Icon = config.icon;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={!isLoading ? onClose : undefined}
        >
            <div
                className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.iconBg} border ${config.iconBorder} mb-4`}
                    >
                        <Icon className={config.iconColor} size={32} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

                    {/* Message */}
                    <p className="text-slate-400 mb-8">{message}</p>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.confirmButton} text-white rounded-xl hover:shadow-lg ${config.confirmButtonShadow} transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? "Processando..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
