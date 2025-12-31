export default function LancamentosSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 w-32 bg-slate-800/50 rounded-full mb-4 animate-pulse"></div>
                <div className="h-10 w-96 bg-slate-800/50 rounded-lg mb-3 animate-pulse"></div>
                <div className="h-6 w-64 bg-slate-800/50 rounded-lg animate-pulse"></div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="h-12 flex-1 max-w-md bg-slate-800/50 rounded-xl animate-pulse"></div>
                    <div className="ml-4 h-12 w-48 bg-slate-800/50 rounded-xl animate-pulse"></div>
                </div>
            </div>

            {/* Lancamentos Cards Skeleton */}
            <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                    <div
                        key={idx}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-slate-800/30 px-6 py-4 border-b border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-4">
                                    <div className="h-5 w-12 bg-slate-700/50 rounded animate-pulse"></div>
                                    <div className="h-5 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                    <div className="h-5 w-48 bg-slate-700/50 rounded animate-pulse"></div>
                                </div>
                                <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Partidas */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Débitos Skeleton */}
                                <div>
                                    <div className="h-5 w-20 bg-slate-700/50 rounded mb-3 animate-pulse"></div>
                                    <div className="space-y-2">
                                        {[...Array(2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
                                            >
                                                <div className="h-4 w-full bg-slate-700/50 rounded mb-2 animate-pulse"></div>
                                                <div className="h-6 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Créditos Skeleton */}
                                <div>
                                    <div className="h-5 w-20 bg-slate-700/50 rounded mb-3 animate-pulse"></div>
                                    <div className="space-y-2">
                                        {[...Array(2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
                                            >
                                                <div className="h-4 w-full bg-slate-700/50 rounded mb-2 animate-pulse"></div>
                                                <div className="h-6 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
