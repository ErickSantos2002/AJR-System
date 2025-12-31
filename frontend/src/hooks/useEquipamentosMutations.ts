import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Equipamento } from "../types";

export const useEquipamentosMutations = () => {
    const queryClient = useQueryClient();

    const criarEquipamento = useMutation({
        mutationFn: async (dados: Partial<Equipamento>) => {
            const { data } = await api.post<Equipamento>("/equipamentos/", dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
        },
    });

    const atualizarEquipamento = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<Equipamento> }) => {
            const { data } = await api.put<Equipamento>(`/equipamentos/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
        },
    });

    const deletarEquipamento = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/equipamentos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
        },
    });

    const toggleAtivoEquipamento = useMutation({
        mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
            const { data } = await api.patch<Equipamento>(`/equipamentos/${id}`, { ativo });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
        },
    });

    return {
        criarEquipamento,
        atualizarEquipamento,
        deletarEquipamento,
        toggleAtivoEquipamento,
    };
};
