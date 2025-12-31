// Máscara para CPF: 000.000.000-00
export const mascaraCPF = (valor: string): string => {
    return valor
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
};

// Máscara para CNPJ: 00.000.000/0000-00
export const mascaraCNPJ = (valor: string): string => {
    return valor
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
};

// Máscara para Telefone: (00) 00000-0000 ou (00) 0000-0000
export const mascaraTelefone = (valor: string): string => {
    valor = valor.replace(/\D/g, "");

    if (valor.length <= 10) {
        // Telefone fixo: (00) 0000-0000
        return valor
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .replace(/(-\d{4})\d+?$/, "$1");
    } else {
        // Celular: (00) 00000-0000
        return valor
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .replace(/(-\d{4})\d+?$/, "$1");
    }
};

// Máscara para CEP: 00000-000
export const mascaraCEP = (valor: string): string => {
    return valor
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{3})\d+?$/, "$1");
};

// Máscara para Placa de Veículo: AAA-0000 ou AAA0A00 (Mercosul)
export const mascaraPlaca = (valor: string): string => {
    valor = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (valor.length <= 7) {
        // Formato antigo: AAA-0000 ou novo: AAA0A00
        if (valor.length <= 3) {
            return valor;
        } else if (valor.length <= 7) {
            return valor.slice(0, 3) + "-" + valor.slice(3);
        }
    }

    return valor.slice(0, 3) + "-" + valor.slice(3, 7);
};

// Máscara para CNH: 00000000000 (11 dígitos)
export const mascaraCNH = (valor: string): string => {
    return valor.replace(/\D/g, "").slice(0, 11);
};

// Remover máscara (deixar apenas números)
export const removerMascara = (valor: string): string => {
    return valor.replace(/\D/g, "");
};
