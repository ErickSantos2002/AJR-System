import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { ContaReceber, StatusContaReceber } from "../types";

export function useContasReceber(filters?: {
    status?: StatusContaReceber;
    data_inicio?: string;
    data_fim?: string;
    categoria?: string;
}) {
    return useQuery({
        queryKey: ["contas-receber", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append("status_filter", filters.status);
            if (filters?.data_inicio) params.append("data_inicio", filters.data_inicio);
            if (filters?.data_fim) params.append("data_fim", filters.data_fim);
            if (filters?.categoria) params.append("categoria", filters.categoria);

            const { data } = await api.get<ContaReceber[]>(
                `/contas-receber?${params.toString()}`
            );
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutos
        refetchOnWindowFocus: true,
    });
}

export function useResumoContasReceber() {
    return useQuery({
        queryKey: ["contas-receber-resumo"],
        queryFn: async () => {
            const { data } = await api.get("/contas-receber/resumo");
            return data;
        },
        staleTime: 1 * 60 * 1000, // 1 minuto
        refetchOnWindowFocus: true,
    });
}

export function useContasReceberMutations() {
    const queryClient = useQueryClient();

    const criarConta = useMutation({
        mutationFn: async (novaConta: Partial<ContaReceber>) => {
            const { data } = await api.post("/contas-receber/", novaConta);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-receber"] });
            queryClient.invalidateQueries({ queryKey: ["contas-receber-resumo"] });
        },
    });

    const atualizarConta = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<ContaReceber> }) => {
            const { data } = await api.put(`/contas-receber/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-receber"] });
            queryClient.invalidateQueries({ queryKey: ["contas-receber-resumo"] });
        },
    });

    const marcarComoRecebido = useMutation({
        mutationFn: async ({ id, data_recebimento }: { id: number; data_recebimento?: string }) => {
            const { data } = await api.patch(`/contas-receber/${id}/receber`, { data_recebimento });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-receber"] });
            queryClient.invalidateQueries({ queryKey: ["contas-receber-resumo"] });
        },
    });

    const deletarConta = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/contas-receber/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contas-receber"] });
            queryClient.invalidateQueries({ queryKey: ["contas-receber-resumo"] });
        },
    });

    return {
        criarConta,
        atualizarConta,
        marcarComoRecebido,
        deletarConta,
    };
}
