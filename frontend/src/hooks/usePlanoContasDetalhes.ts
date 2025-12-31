import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

interface SaldoConta {
    conta_id: number;
    codigo: string;
    descricao: string;
    natureza: string;
    debitos: number;
    creditos: number;
    saldo: number;
}

interface Movimentacao {
    id: number;
    data: string;
    historico_id: number;
    complemento: string | null;
    tipo: "DEBITO" | "CREDITO";
    valor: number;
    lancamento_id: number;
}

interface MovimentacoesConta {
    conta_id: number;
    codigo: string;
    descricao: string;
    total_movimentacoes: number;
    movimentacoes: Movimentacao[];
}

export function useSaldoConta(contaId: number | null) {
    return useQuery({
        queryKey: ["saldo-conta", contaId],
        queryFn: async () => {
            if (!contaId) return null;
            const { data } = await api.get<SaldoConta>(`/plano-contas/${contaId}/saldo`);
            return data;
        },
        enabled: !!contaId,
        staleTime: 2 * 60 * 1000, // 2 minutos
    });
}

export function useMovimentacoesConta(contaId: number | null, limit: number = 10) {
    return useQuery({
        queryKey: ["movimentacoes-conta", contaId, limit],
        queryFn: async () => {
            if (!contaId) return null;
            const { data } = await api.get<MovimentacoesConta>(
                `/plano-contas/${contaId}/movimentacoes?limit=${limit}`
            );
            return data;
        },
        enabled: !!contaId,
        staleTime: 2 * 60 * 1000, // 2 minutos
    });
}
