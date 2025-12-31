import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { DashboardData } from "../types";

export const exportToExcel = (data: DashboardData) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumo Financeiro
    const resumoFinanceiro = [
        ["RESUMO FINANCEIRO"],
        [""],
        ["Indicador", "Valor"],
        ["Saldo Disponível", data.financeiro.saldo_disponivel],
        ["Total a Receber", data.financeiro.total_receber],
        ["Total a Pagar", data.financeiro.total_pagar],
        ["Salários a Pagar", data.financeiro.salarios_pagar],
        ["Impostos a Pagar", data.financeiro.impostos_pagar],
        [""],
        ["Receitas do Mês", data.financeiro.receitas_mes],
        ["Despesas do Mês", data.financeiro.despesas_mes],
        ["Resultado do Mês", data.financeiro.resultado_mes],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(resumoFinanceiro);
    XLSX.utils.book_append_sheet(wb, ws1, "Resumo Financeiro");

    // Sheet 2: Totais Operacionais
    const totaisOperacionais = [
        ["TOTAIS OPERACIONAIS"],
        [""],
        ["Item", "Quantidade"],
        ["Clientes", data.totais.clientes],
        ["Equipamentos", data.totais.equipamentos],
        ["Motoristas", data.totais.motoristas],
        ["Lançamentos", data.totais.lancamentos],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(totaisOperacionais);
    XLSX.utils.book_append_sheet(wb, ws2, "Totais Operacionais");

    // Sheet 3: Receitas por Tipo
    const receitasHeader = [["RECEITAS POR TIPO"], [""], ["Tipo", "Valor"]];
    const receitasData = data.graficos.receitas_por_tipo.map((item) => [
        item.nome,
        item.valor,
    ]);
    const ws3 = XLSX.utils.aoa_to_sheet([...receitasHeader, ...receitasData]);
    XLSX.utils.book_append_sheet(wb, ws3, "Receitas por Tipo");

    // Sheet 4: Despesas por Categoria
    const despesasHeader = [["DESPESAS POR CATEGORIA"], [""], ["Categoria", "Valor"]];
    const despesasData = data.graficos.despesas_por_categoria.map((item) => [
        item.nome,
        item.valor,
    ]);
    const ws4 = XLSX.utils.aoa_to_sheet([...despesasHeader, ...despesasData]);
    XLSX.utils.book_append_sheet(wb, ws4, "Despesas por Categoria");

    // Sheet 5: Evolução Mensal
    const evolucaoHeader = [
        ["EVOLUÇÃO MENSAL"],
        [""],
        ["Mês", "Receitas", "Despesas", "Resultado"],
    ];
    const evolucaoData = data.graficos.evolucao_mensal.map((item) => [
        item.mes,
        item.receitas,
        item.despesas,
        item.resultado,
    ]);
    const ws5 = XLSX.utils.aoa_to_sheet([...evolucaoHeader, ...evolucaoData]);
    XLSX.utils.book_append_sheet(wb, ws5, "Evolução Mensal");

    // Sheet 6: Últimos Lançamentos
    const lancamentosHeader = [
        ["ÚLTIMOS LANÇAMENTOS"],
        [""],
        ["ID", "Data", "Histórico ID", "Complemento", "Valor"],
    ];
    const lancamentosData = data.ultimos_lancamentos.map((item) => [
        item.id,
        item.data,
        item.historico_id,
        item.complemento || "-",
        item.valor,
    ]);
    const ws6 = XLSX.utils.aoa_to_sheet([...lancamentosHeader, ...lancamentosData]);
    XLSX.utils.book_append_sheet(wb, ws6, "Últimos Lançamentos");

    // Gerar arquivo
    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Dashboard_AJR_${timestamp}.xlsx`);
};

export const exportToPDF = async (element: HTMLElement) => {
    if (!element) {
        console.error("Elemento não fornecido para exportar");
        return;
    }

    try {
        // Capturar o elemento como imagem
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: "#0f172a",
            logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Adicionar primeira página
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Adicionar páginas adicionais se necessário
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const timestamp = new Date().toISOString().split("T")[0];
        pdf.save(`Dashboard_AJR_${timestamp}.pdf`);
    } catch (error) {
        console.error("Erro ao exportar PDF:", error);
    }
};
