import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { CentroCusto } from "../types";

export const useCentrosCusto = () => {
    return useQuery({
        queryKey: ["centros-custo"],
        queryFn: async () => {
            const { data } = await api.get<CentroCusto[]>("/centros-custo/");
            return data;
        },
    });
};

export const useCentroCusto = (id: number) => {
    return useQuery({
        queryKey: ["centros-custo", id],
        queryFn: async () => {
            const { data } = await api.get<CentroCusto>(`/centros-custo/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
