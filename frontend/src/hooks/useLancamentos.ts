import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Lancamento, PlanoContas, Historico } from "../types";

export function useLancamentos() {
    return useQuery({
        queryKey: ["lancamentos"],
        queryFn: async () => {
            const { data } = await api.get<Lancamento[]>("/lancamentos/");
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: true,
        retry: 2,
    });
}

export function useHistoricos() {
    return useQuery({
        queryKey: ["historicos"],
        queryFn: async () => {
            const { data } = await api.get<Historico[]>("/historicos/");
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutos (mudam pouco)
        refetchOnWindowFocus: false,
        retry: 2,
    });
}

export function useContasAnaliticas() {
    return useQuery({
        queryKey: ["contas-analiticas"],
        queryFn: async () => {
            const { data } = await api.get<PlanoContas[]>("/plano-contas/");
            // Filtrar apenas contas analíticas (que aceitam lançamento) e ativas
            return data.filter((c) => c.aceita_lancamento && c.ativo);
        },
        staleTime: 10 * 60 * 1000, // 10 minutos
        refetchOnWindowFocus: false,
        retry: 2,
    });
}
