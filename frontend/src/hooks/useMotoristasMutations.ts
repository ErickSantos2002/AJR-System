import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Motorista } from "../types";

export const useMotoristasMutations = () => {
    const queryClient = useQueryClient();

    const criarMotorista = useMutation({
        mutationFn: async (dados: Partial<Motorista>) => {
            const { data } = await api.post<Motorista>("/motoristas/", dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["motoristas"] });
        },
    });

    const atualizarMotorista = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<Motorista> }) => {
            const { data } = await api.put<Motorista>(`/motoristas/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["motoristas"] });
        },
    });

    const deletarMotorista = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/motoristas/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["motoristas"] });
        },
    });

    const toggleAtivoMotorista = useMutation({
        mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
            const { data } = await api.patch<Motorista>(`/motoristas/${id}`, { ativo });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["motoristas"] });
        },
    });

    return {
        criarMotorista,
        atualizarMotorista,
        deletarMotorista,
        toggleAtivoMotorista,
    };
};
