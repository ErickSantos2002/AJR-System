import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Historico } from "../types";

export const useHistoricos = () => {
    return useQuery({
        queryKey: ["historicos"],
        queryFn: async () => {
            const { data } = await api.get<Historico[]>("/historicos/");
            return data;
        },
    });
};

export const useHistorico = (id: number) => {
    return useQuery({
        queryKey: ["historicos", id],
        queryFn: async () => {
            const { data } = await api.get<Historico>(`/historicos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
