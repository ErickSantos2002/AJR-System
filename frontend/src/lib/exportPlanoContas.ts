import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import type { PlanoContas } from "../types";

export const exportPlanoContasToExcel = (contas: PlanoContas[]) => {
    const wb = XLSX.utils.book_new();

    // Preparar dados para exportação
    const data = contas.map((conta) => ({
        Código: conta.codigo,
        Descrição: conta.descricao,
        Tipo: conta.tipo,
        Natureza: conta.natureza,
        Nível: conta.nivel,
        "Aceita Lançamento": conta.aceita_lancamento ? "Sim" : "Não",
        Ativo: conta.ativo ? "Sim" : "Não",
    }));

    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Configurar largura das colunas
    const colWidths = [
        { wch: 15 }, // Código
        { wch: 50 }, // Descrição
        { wch: 20 }, // Tipo
        { wch: 15 }, // Natureza
        { wch: 8 },  // Nível
        { wch: 18 }, // Aceita Lançamento
        { wch: 10 }, // Ativo
    ];
    ws["!cols"] = colWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Plano de Contas");

    // Gerar arquivo
    const timestamp = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Plano_de_Contas_${timestamp}.xlsx`);
};

export const exportPlanoContasToPDF = (contas: PlanoContas[]) => {
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Configurações
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 7;
    let y = margin;

    // Função auxiliar para adicionar nova página
    const checkPageBreak = () => {
        if (y > pageHeight - margin - 10) {
            pdf.addPage();
            y = margin;
            return true;
        }
        return false;
    };

    // Título
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Plano de Contas", margin, y);
    y += lineHeight + 3;

    // Data
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    pdf.text(`Gerado em: ${dataAtual}`, margin, y);
    y += lineHeight + 5;

    // Total de contas
    pdf.setFontSize(10);
    pdf.text(`Total de contas: ${contas.length}`, margin, y);
    y += lineHeight + 3;

    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
    y += lineHeight;

    // Cabeçalho da tabela
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("Código", margin, y);
    pdf.text("Descrição", margin + 30, y);
    pdf.text("Tipo", margin + 100, y);
    pdf.text("Nat.", margin + 140, y);
    pdf.text("Nv", margin + 165, y);
    pdf.text("Lanç", margin + 180, y);
    y += lineHeight;

    // Linha separadora
    pdf.line(margin, y, pageWidth - margin, y);
    y += 2;

    // Dados
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    contas.forEach((conta, index) => {
        checkPageBreak();

        // Indentação baseada no nível
        const indent = (conta.nivel - 1) * 3;

        // Código
        pdf.text(conta.codigo, margin, y);

        // Descrição com indentação
        const descricao = conta.descricao.length > 40
            ? conta.descricao.substring(0, 37) + "..."
            : conta.descricao;
        pdf.text(descricao, margin + 30 + indent, y);

        // Tipo (abreviado)
        const tipoAbrev = {
            ATIVO: "AT",
            PASSIVO: "PS",
            PATRIMONIO_LIQUIDO: "PL",
            RECEITA: "RC",
            DESPESA: "DP",
        }[conta.tipo] || conta.tipo;
        pdf.text(tipoAbrev, margin + 100, y);

        // Natureza (abreviado)
        const natAbrev = conta.natureza === "DEVEDORA" ? "DEV" : "CRE";
        pdf.text(natAbrev, margin + 140, y);

        // Nível
        pdf.text(conta.nivel.toString(), margin + 165, y);

        // Aceita Lançamento
        pdf.text(conta.aceita_lancamento ? "Sim" : "Não", margin + 180, y);

        y += lineHeight;

        // Linha separadora a cada 5 contas
        if ((index + 1) % 5 === 0) {
            pdf.setDrawColor(240, 240, 240);
            pdf.line(margin, y - 1, pageWidth - margin, y - 1);
        }
    });

    // Rodapé na última página
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 5,
            { align: "center" }
        );
    }

    // Salvar arquivo
    const timestamp = new Date().toISOString().split("T")[0];
    pdf.save(`Plano_de_Contas_${timestamp}.pdf`);
};
