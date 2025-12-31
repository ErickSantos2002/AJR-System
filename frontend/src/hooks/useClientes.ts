import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import type { Cliente } from "../types";

export const useClientes = () => {
    return useQuery({
        queryKey: ["clientes"],
        queryFn: async () => {
            const { data } = await api.get<Cliente[]>("/clientes/");
            return data;
        },
    });
};

export const useCliente = (id: number) => {
    return useQuery({
        queryKey: ["clientes", id],
        queryFn: async () => {
            const { data } = await api.get<Cliente>(`/clientes/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
