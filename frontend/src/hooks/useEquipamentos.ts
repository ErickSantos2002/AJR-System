import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Equipamento } from "../types";

export const useEquipamentos = () => {
    return useQuery({
        queryKey: ["equipamentos"],
        queryFn: async () => {
            const { data } = await api.get<Equipamento[]>("/equipamentos/");
            return data;
        },
    });
};

export const useEquipamento = (id: number) => {
    return useQuery({
        queryKey: ["equipamentos", id],
        queryFn: async () => {
            const { data } = await api.get<Equipamento>(`/equipamentos/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
