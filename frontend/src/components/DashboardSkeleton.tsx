export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header Skeleton */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <div className="h-8 w-40 bg-slate-700/50 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-12 w-64 bg-slate-700/50 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-6 w-80 bg-slate-700/50 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Cards Financeiros Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-6 animate-pulse"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 bg-slate-700/50 rounded-xl"></div>
                            <div className="h-5 w-5 bg-slate-700/50 rounded"></div>
                        </div>
                        <div className="h-4 w-24 bg-slate-700/50 rounded mb-2"></div>
                        <div className="h-8 w-32 bg-slate-700/50 rounded"></div>
                        <div className="h-3 w-20 bg-slate-700/50 rounded mt-2"></div>
                    </div>
                ))}
            </div>

            {/* Totais Operacionais Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 animate-pulse"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-slate-700/50 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-4 w-16 bg-slate-700/50 rounded mb-2"></div>
                                <div className="h-6 w-12 bg-slate-700/50 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráficos Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 animate-pulse"
                    >
                        <div className="h-6 w-48 bg-slate-700/50 rounded mb-6"></div>
                        <div className="h-[300px] bg-slate-700/30 rounded-xl"></div>
                    </div>
                ))}
            </div>

            {/* Evolução Mensal Skeleton */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 animate-pulse">
                <div className="h-6 w-48 bg-slate-700/50 rounded mb-6"></div>
                <div className="h-[300px] bg-slate-700/30 rounded-xl"></div>
            </div>

            {/* Últimos Lançamentos Skeleton */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-48 bg-slate-700/50 rounded mb-6"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-slate-700/50 rounded-lg"></div>
                                <div>
                                    <div className="h-5 w-48 bg-slate-700/50 rounded mb-2"></div>
                                    <div className="h-4 w-24 bg-slate-700/50 rounded"></div>
                                </div>
                            </div>
                            <div className="h-6 w-24 bg-slate-700/50 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
