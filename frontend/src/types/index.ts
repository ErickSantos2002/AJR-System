export interface PlanoContas {
    id: number;
    codigo: string;
    descricao: string;
    tipo: "ATIVO" | "PASSIVO" | "PATRIMONIO_LIQUIDO" | "RECEITA" | "DESPESA";
    natureza: "DEVEDORA" | "CREDORA";
    nivel: number;
    conta_pai_id: number | null;
    aceita_lancamento: boolean;
    ativo: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface Cliente {
    id: number;
    nome: string;
    tipo_pessoa: "F" | "J";
    cpf_cnpj: string;
    telefone: string | null;
    email: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    ativo: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface Equipamento {
    id: number;
    tipo: "CAMINHAO" | "RETROESCAVADEIRA" | "TRATOR" | "ESCAVADEIRA" | "PA_CARREGADEIRA" | "ROLO_COMPACTADOR" | "OUTRO";
    placa: string | null;
    identificador: string;
    modelo: string;
    marca: string;
    ano_fabricacao: number | null;
    numero_serie: string | null;
    valor_aquisicao: number | null;
    hodometro_inicial: number | null;
    hodometro_atual: number | null;
    ativo: boolean;
    observacoes: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface Motorista {
    id: number;
    nome: string;
    cpf: string;
    cnh: string;
    categoria_cnh: string;
    validade_cnh: string;
    telefone: string | null;
    endereco: string | null;
    data_nascimento: string | null;
    data_admissao: string | null;
    ativo: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface Historico {
    id: number;
    codigo: string;
    descricao: string;
    ativo: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface CentroCusto {
    id: number;
    codigo: string;
    descricao: string;
    ativo: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface Partida {
    id?: number;
    conta_id: number;
    tipo: "DEBITO" | "CREDITO";
    valor: number;
    centro_custo_id?: number | null;
}

export interface Lancamento {
    id: number;
    data_lancamento: string;
    historico_id: number;
    complemento: string | null;
    created_at: string;
    updated_at: string | null;
    partidas: Partida[];
}

export interface DashboardStats {
    total_clientes: number;
    total_equipamentos: number;
    total_motoristas: number;
    total_lancamentos: number;
    total_contas: number;
}

export interface DashboardData {
    totais: {
        clientes: number;
        equipamentos: number;
        motoristas: number;
        lancamentos: number;
    };
    financeiro: {
        saldo_disponivel: number;
        total_receber: number;
        total_pagar: number;
        salarios_pagar: number;
        impostos_pagar: number;
        receitas_mes: number;
        despesas_mes: number;
        resultado_mes: number;
    };
    graficos: {
        receitas_por_tipo: Array<{ nome: string; valor: number }>;
        despesas_por_categoria: Array<{ nome: string; valor: number }>;
        evolucao_mensal: Array<{
            mes: string;
            receitas: number;
            despesas: number;
            resultado: number;
        }>;
    };
    ultimos_lancamentos: Array<{
        id: number;
        data: string;
        historico_id: number;
        complemento: string | null;
        valor: number;
    }>;
}
