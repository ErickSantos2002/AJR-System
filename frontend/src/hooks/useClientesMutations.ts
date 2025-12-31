import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { Cliente } from "../types";

export const useClientesMutations = () => {
    const queryClient = useQueryClient();

    const criarCliente = useMutation({
        mutationFn: async (dados: Partial<Cliente>) => {
            const { data } = await api.post<Cliente>("/clientes/", dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
    });

    const atualizarCliente = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: Partial<Cliente> }) => {
            const { data } = await api.put<Cliente>(`/clientes/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
    });

    const deletarCliente = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/clientes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
    });

    const toggleAtivoCliente = useMutation({
        mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
            const { data } = await api.patch<Cliente>(`/clientes/${id}`, { ativo });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clientes"] });
        },
    });

    return {
        criarCliente,
        atualizarCliente,
        deletarCliente,
        toggleAtivoCliente,
    };
};
