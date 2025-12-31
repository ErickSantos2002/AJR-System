import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { Usuario, UsuarioCreate, UsuarioUpdate } from "../types/usuario";

export function useUsuarios() {
    return useQuery({
        queryKey: ["usuarios"],
        queryFn: async () => {
            const response = await api.get<Usuario[]>("/api/auth/users");
            return response.data;
        },
    });
}

export const useUsuariosMutations = () => {
    const queryClient = useQueryClient();

    const criarUsuario = useMutation({
        mutationFn: async (data: UsuarioCreate) => {
            const response = await api.post<Usuario>("/api/auth/register", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios"] });
        },
    });

    const atualizarUsuario = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UsuarioUpdate }) => {
            const response = await api.patch<Usuario>(`/api/auth/users/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios"] });
        },
    });

    const deletarUsuario = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/auth/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuarios"] });
        },
    });

    return {
        criarUsuario,
        atualizarUsuario,
        deletarUsuario,
    };
};
