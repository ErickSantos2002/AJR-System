import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { PlanoContas } from "../types";

export function usePlanoContas() {
    return useQuery({
        queryKey: ["plano-contas"],
        queryFn: async () => {
            const { data } = await api.get<PlanoContas[]>("/plano-contas/");
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutos (plano de contas muda pouco)
        refetchOnWindowFocus: true,
        retry: 2,
    });
}
