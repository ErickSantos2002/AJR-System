import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    totalItems?: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage = 10,
    totalItems,
    onItemsPerPageChange,
    showItemsPerPage = true,
    className = "",
}: PaginationProps) {
    const itemsPerPageOptions = [10, 25, 50, 100];

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

    return (
        <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
        >
            {/* Items per page */}
            {showItemsPerPage && onItemsPerPageChange && (
                <div className="flex items-center gap-2">
                    <label className="text-slate-400 text-sm">Itens por página:</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Page info */}
            {totalItems !== undefined && (
                <div className="text-slate-400 text-sm">
                    Mostrando {startItem} - {endItem} de {totalItems} itens
                </div>
            )}

            {/* Page buttons */}
            <div className="flex items-center gap-2">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-800/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Primeira página"
                >
                    <ChevronsLeft size={18} />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-800/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Página anterior"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && onPageChange(page)}
                            disabled={page === "..." || page === currentPage}
                            className={`min-w-[40px] h-[40px] rounded-xl text-sm font-medium transition-all ${
                                page === currentPage
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                    : page === "..."
                                    ? "text-slate-500 cursor-default"
                                    : "bg-slate-800/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-800/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Próxima página"
                >
                    <ChevronRight size={18} />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-800/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Última página"
                >
                    <ChevronsRight size={18} />
                </button>
            </div>
        </div>
    );
}
