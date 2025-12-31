import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Historico } from "../types";

export const useHistoricosMutations = () => {
    const queryClient = useQueryClient();

    const criarHistorico = useMutation({
        mutationFn: async (dados: Partial<Historico>) => {
            const { data } = await api.post<Historico>("/historicos/", dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["historicos"] });
        },
    });

    const atualizarHistorico = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<Historico> }) => {
            const { data } = await api.put<Historico>(`/historicos/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["historicos"] });
        },
    });

    const deletarHistorico = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/historicos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["historicos"] });
        },
    });

    const toggleAtivoHistorico = useMutation({
        mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
            const { data } = await api.patch<Historico>(`/historicos/${id}`, { ativo });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["historicos"] });
        },
    });

    return {
        criarHistorico,
        atualizarHistorico,
        deletarHistorico,
        toggleAtivoHistorico,
    };
};
