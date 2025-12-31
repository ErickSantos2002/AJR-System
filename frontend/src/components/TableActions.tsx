import type { LucideIcon } from "lucide-react";
import { Edit2, Trash2, Eye, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface TableAction {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "danger" | "success" | "warning";
    hidden?: boolean;
}

interface TableActionsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    customActions?: TableAction[];
    variant?: "buttons" | "dropdown";
    className?: string;
}

export default function TableActions({
    onEdit,
    onDelete,
    onView,
    customActions = [],
    variant = "buttons",
    className = "",
}: TableActionsProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const defaultActions: TableAction[] = [
        ...(onView
            ? [
                  {
                      label: "Visualizar",
                      icon: Eye,
                      onClick: onView,
                      variant: "default" as const,
                  },
              ]
            : []),
        ...(onEdit
            ? [
                  {
                      label: "Editar",
                      icon: Edit2,
                      onClick: onEdit,
                      variant: "default" as const,
                  },
              ]
            : []),
        ...(onDelete
            ? [
                  {
                      label: "Excluir",
                      icon: Trash2,
                      onClick: onDelete,
                      variant: "danger" as const,
                  },
              ]
            : []),
        ...customActions,
    ].filter((action) => !action.hidden);

    const variantClasses = {
        default: "text-slate-300 hover:text-white hover:bg-slate-700/50",
        danger: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
        success: "text-green-400 hover:text-green-300 hover:bg-green-500/10",
        warning: "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10",
    };

    if (variant === "dropdown") {
        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
                >
                    <MoreVertical size={18} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50 py-2">
                        {defaultActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.onClick();
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                        variantClasses[action.variant || "default"]
                                    }`}
                                >
                                    {Icon && <Icon size={16} />}
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {onView && (
                <button
                    onClick={onView}
                    className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
                    title="Visualizar"
                >
                    <Eye size={18} />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="p-2 rounded-xl hover:bg-blue-500/10 transition-colors text-blue-400 hover:text-blue-300"
                    title="Editar"
                >
                    <Edit2 size={18} />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
            )}
            {customActions.map((action, index) => {
                if (action.hidden) return null;
                const Icon = action.icon;
                return (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`p-2 rounded-xl transition-colors ${
                            variantClasses[action.variant || "default"]
                        }`}
                        title={action.label}
                    >
                        {Icon && <Icon size={18} />}
                    </button>
                );
            })}
        </div>
    );
}
