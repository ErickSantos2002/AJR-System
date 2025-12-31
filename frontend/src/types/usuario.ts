export interface Usuario {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface UsuarioCreate {
    nome: string;
    email: string;
    senha: string;
    is_admin?: boolean;
}

export interface UsuarioUpdate {
    nome?: string;
    email?: string;
    senha?: string;
    ativo?: boolean;
    is_admin?: boolean;
}
