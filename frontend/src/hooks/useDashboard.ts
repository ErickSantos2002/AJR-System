import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { DashboardData } from "../types";

export function useDashboard(period?: string) {
    return useQuery({
        queryKey: ["dashboard", period],
        queryFn: async () => {
            const params = period ? { period } : {};
            const { data } = await api.get<DashboardData>("/dashboard/", { params });
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
        refetchOnWindowFocus: true, // Revalida quando usuário volta para a aba
        refetchInterval: 30 * 60 * 1000, // Auto-refresh a cada 30 minutos
    });
}
