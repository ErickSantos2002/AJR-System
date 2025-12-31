import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { CentroCusto } from "../types";

export const useCentrosCustoMutations = () => {
    const queryClient = useQueryClient();

    const criarCentroCusto = useMutation({
        mutationFn: async (dados: Partial<CentroCusto>) => {
            const { data } = await api.post<CentroCusto>("/centros-custo/", dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
        },
    });

    const atualizarCentroCusto = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<CentroCusto> }) => {
            const { data } = await api.put<CentroCusto>(`/centros-custo/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
        },
    });

    const deletarCentroCusto = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/centros-custo/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
        },
    });

    const toggleAtivoCentroCusto = useMutation({
        mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
            const { data } = await api.patch<CentroCusto>(`/centros-custo/${id}`, { ativo });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["centros-custo"] });
        },
    });

    return {
        criarCentroCusto,
        atualizarCentroCusto,
        deletarCentroCusto,
        toggleAtivoCentroCusto,
    };
};
