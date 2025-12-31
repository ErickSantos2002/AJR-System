import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../api/axios";

interface User {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar token do localStorage ao iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            loadUser(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    // Configurar token no axios quando ele mudar
    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("token", token);
        } else {
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token]);

    async function loadUser(authToken: string) {
        try {
            api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
            const response = await api.get("/api/auth/me");
            setUser(response.data);
        } catch (error) {
            console.error("Erro ao carregar usuário:", error);
            // Token inválido ou expirado
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, senha: string) {
        try {
            const response = await api.post("/api/auth/login", { email, senha });
            const { access_token } = response.data;

            setToken(access_token);
            await loadUser(access_token);
        } catch (error: any) {
            console.error("Erro ao fazer login:", error);
            throw new Error(
                error.response?.data?.detail || "Erro ao fazer login"
            );
        }
    }

    function logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
    }

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
}
