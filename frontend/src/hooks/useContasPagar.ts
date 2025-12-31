import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { ContaPagar, StatusContaPagar } from "../types";

export function useContasPagar(filters?: {
    status?: StatusContaPagar;
    data_inicio?: string;
    data_fim?: string;
    categoria?: string;
}) {
    return useQuery({
        queryKey: ["contas-pagar", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append("status_filter", filters.status);
            if (filters?.data_inicio) params.append("data_inicio", filters.data_inicio);
            if (filters?.data_fim) params.append("data_fim", filters.data_fim);
            if (filters?.categoria) params.append("categoria", filters.categoria);

            const { data } = await api.get<ContaPagar[]>(
                `/contas-pagar?${params.toString()}`
            );
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutos
        refetchOnWindowFocus: true,
    });
}

export function useResumoContasPagar() {
    return useQuery({
        queryKey: ["contas-pagar-resumo"],
        queryFn: async () => {
            const { data } = await api.get("/contas-pagar/resumo");
            return data;
        },
        staleTime: 1 * 60 * 1000, // 1 minuto
        refetchOnWindowFocus: true,
    });
}

export function useContasPagarMutations() {
    const queryClient = useQueryClient();

    const criarConta = useMutation({
        mutationFn: async (novaConta: Partial<ContaPagar>) => {
            const { data } = await api.post("/contas-pagar/", novaConta);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
            queryClient.invalidateQueries({ queryKey: ["contas-pagar-resumo"] });
        },
    });

    const atualizarConta = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<ContaPagar> }) => {
            const { data } = await api.put(`/contas-pagar/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
            queryClient.invalidateQueries({ queryKey: ["contas-pagar-resumo"] });
        },
    });

    const marcarComoPago = useMutation({
        mutationFn: async ({ id, data_pagamento }: { id: number; data_pagamento?: string }) => {
            const { data } = await api.patch(`/contas-pagar/${id}/pagar`, { data_pagamento });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
            queryClient.invalidateQueries({ queryKey: ["contas-pagar-resumo"] });
        },
    });

    const deletarConta = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/contas-pagar/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-pagar"] });
            queryClient.invalidateQueries({ queryKey: ["contas-pagar-resumo"] });
        },
    });

    return {
        criarConta,
        atualizarConta,
        marcarComoPago,
        deletarConta,
    };
}
