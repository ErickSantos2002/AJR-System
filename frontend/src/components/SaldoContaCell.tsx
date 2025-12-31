import { useSaldoConta } from "../hooks/usePlanoContasDetalhes";

interface SaldoContaCellProps {
    contaId: number;
    aceitaLancamento: boolean;
}

export default function SaldoContaCell({ contaId, aceitaLancamento }: SaldoContaCellProps) {
    const { data: saldo, isLoading } = useSaldoConta(aceitaLancamento ? contaId : null);

    if (!aceitaLancamento) {
        return <span className="text-slate-600 text-sm">-</span>;
    }

    if (isLoading) {
        return (
            <div className="h-5 w-20 bg-slate-700/50 rounded animate-pulse ml-auto"></div>
        );
    }

    if (!saldo) {
        return <span className="text-slate-400 text-sm">R$ 0,00</span>;
    }

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(valor);
    };

    const cor = saldo.saldo >= 0 ? "text-emerald-400" : "text-rose-400";

    return (
        <span className={`text-sm font-semibold ${cor}`}>
            {formatarMoeda(saldo.saldo)}
        </span>
    );
}
