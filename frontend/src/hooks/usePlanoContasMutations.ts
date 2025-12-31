import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import type { PlanoContas } from "../types";

export function usePlanoContasMutations() {
    const queryClient = useQueryClient();

    const criarConta = useMutation({
        mutationFn: async (novaConta: Partial<PlanoContas>) => {
            const { data } = await api.post("/plano-contas/", novaConta);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plano-contas"] });
        },
    });

    const atualizarConta = useMutation({
        mutationFn: async ({
            id,
            dados,
        }: {
            id: number;
            dados: Partial<PlanoContas>;
        }) => {
            const { data } = await api.put(`/plano-contas/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plano-contas"] });
        },
    });

    const deletarConta = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/plano-contas/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plano-contas"] });
        },
    });

    const toggleAtivoConta = useMutation({
        mutationFn: async ({ id, ativo }: { id: number; ativo: boolean }) => {
            const { data } = await api.patch(`/plano-contas/${id}`, { ativo });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plano-contas"] });
        },
    });

    return {
        criarConta,
        atualizarConta,
        deletarConta,
        toggleAtivoConta,
    };
}
