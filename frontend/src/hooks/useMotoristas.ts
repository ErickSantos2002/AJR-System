import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Motorista } from "../types";

export const useMotoristas = () => {
    return useQuery({
        queryKey: ["motoristas"],
        queryFn: async () => {
            const { data } = await api.get<Motorista[]>("/motoristas/");
            return data;
        },
    });
};

export const useMotorista = (id: number) => {
    return useQuery({
        queryKey: ["motoristas", id],
        queryFn: async () => {
            const { data } = await api.get<Motorista>(`/motoristas/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
