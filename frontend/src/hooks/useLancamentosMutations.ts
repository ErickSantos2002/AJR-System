import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

interface NovoLancamento {
    data_lancamento: string;
    historico_id: number;
    complemento?: string;
    partidas: Array<{
        conta_id: number;
        tipo: "DEBITO" | "CREDITO";
        valor: number;
    }>;
}

export function useLancamentosMutations() {
    const queryClient = useQueryClient();

    const criarLancamento = useMutation({
        mutationFn: async (novoLancamento: NovoLancamento) => {
            const { data } = await api.post("/lancamentos/", novoLancamento);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
            queryClient.invalidateQueries({ queryKey: ["saldo-conta"] });
            queryClient.invalidateQueries({ queryKey: ["movimentacoes-conta"] });
        },
    });

    const atualizarLancamento = useMutation({
        mutationFn: async ({ id, dados }: { id: number; dados: NovoLancamento }) => {
            const { data } = await api.put(`/lancamentos/${id}`, dados);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
            queryClient.invalidateQueries({ queryKey: ["saldo-conta"] });
            queryClient.invalidateQueries({ queryKey: ["movimentacoes-conta"] });
        },
    });

    const deletarLancamento = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/lancamentos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
            queryClient.invalidateQueries({ queryKey: ["saldo-conta"] });
            queryClient.invalidateQueries({ queryKey: ["movimentacoes-conta"] });
        },
    });

    return {
        criarLancamento,
        atualizarLancamento,
        deletarLancamento,
    };
}
