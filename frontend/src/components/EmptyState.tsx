import type { LucideIcon } from "lucide-react";
import { Inbox, FileX, Search } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    variant?: "default" | "search" | "error";
    className?: string;
    children?: ReactNode;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    variant = "default",
    className = "",
    children,
}: EmptyStateProps) {
    const defaultIcons = {
        default: Inbox,
        search: Search,
        error: FileX,
    };

    const Icon = icon || defaultIcons[variant];

    const colors = {
        default: {
            icon: "text-slate-400",
            bg: "bg-slate-500/20",
            border: "border-slate-500/30",
        },
        search: {
            icon: "text-blue-400",
            bg: "bg-blue-500/20",
            border: "border-blue-500/30",
        },
        error: {
            icon: "text-orange-400",
            bg: "bg-orange-500/20",
            border: "border-orange-500/30",
        },
    };

    const colorScheme = colors[variant];

    return (
        <div
            className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
        >
            <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${colorScheme.bg} border ${colorScheme.border} mb-6`}
            >
                <Icon className={colorScheme.icon} size={40} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

            <p className="text-slate-400 mb-6 max-w-md">{description}</p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium"
                >
                    {action.icon && <action.icon size={20} />}
                    {action.label}
                </button>
            )}

            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}
