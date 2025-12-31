export default function PlanoContasSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header Skeleton */}
            <div className="mb-8 relative">
                <div className="absolute -top-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="inline-block mb-4">
                        <div className="h-8 w-32 bg-slate-800/50 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-10 w-64 bg-slate-800/50 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-6 w-96 bg-slate-800/50 rounded-lg animate-pulse"></div>
                </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="h-12 max-w-md bg-slate-800/50 rounded-xl animate-pulse"></div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700/50">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse mx-auto"></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {[...Array(10)].map((_, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30">
                                    <td className="px-6 py-4">
                                        <div className="h-5 w-20 bg-slate-800/50 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-5 w-48 bg-slate-800/50 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 w-24 bg-slate-800/50 rounded-full animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 w-28 bg-slate-800/50 rounded-full animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="h-5 w-5 bg-slate-800/50 rounded-full animate-pulse mx-auto"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="mt-6">
                <div className="h-5 w-40 bg-slate-800/50 rounded animate-pulse"></div>
            </div>
        </div>
    );
}
