import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
            gcTime: 10 * 60 * 1000, // 10 minutos - tempo que dados ficam em cache
            refetchOnWindowFocus: true, // Revalida quando usuário volta para a aba
            retry: 2, // Tenta 2 vezes em caso de erro
            refetchOnReconnect: true, // Revalida quando reconecta à internet
        },
    },
});
