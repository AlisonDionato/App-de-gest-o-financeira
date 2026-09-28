import { listDespesas } from "./expenses.service";
import { listReceitas } from "./incomes.service";
import { listCategorias } from "./categories.service";
import type { Categoria } from "../types";

export type PeriodFilter =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year";

export interface PeriodRange {
  fromISO: string;
  toISO: string;
  label: string;
}

export function getPeriodRange(filter: PeriodFilter): PeriodRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (filter === "this_month") {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return {
      fromISO: start.toISOString(),
      toISO: end.toISOString(),
      label: "Este mês",
    };
  }

  if (filter === "last_month") {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return {
      fromISO: start.toISOString(),
      toISO: end.toISOString(),
      label: "Mês anterior",
    };
  }

  if (filter === "last_3_months") {
    const start = new Date(year, month - 2, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return {
      fromISO: start.toISOString(),
      toISO: end.toISOString(),
      label: "Últimos 3 meses",
    };
  }

  if (filter === "last_6_months") {
    const start = new Date(year, month - 5, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    return {
      fromISO: start.toISOString(),
      toISO: end.toISOString(),
      label: "Últimos 6 meses",
    };
  }

  // this_year
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);
  return {
    fromISO: start.toISOString(),
    toISO: end.toISOString(),
    label: "Este ano",
  };
}

export interface CategorySummary {
  categoriaId: string;
  nome: string;
  cor: string;
  icone: string;
  total: number;
  percentual: number;
}

export interface ReportData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  gastosNoCartao: number;
  gastosForaCartao: number;
  despesasRecorrentes: number;
  despesasAvulsas: number;
  categoriasDespesa: CategorySummary[];
  cartaoPorCategoria: CategorySummary[];
}

export async function getReportData(filter: PeriodFilter): Promise<ReportData> {
  const { fromISO, toISO } = getPeriodRange(filter);
  const [allDespesas, allReceitas, categorias] = await Promise.all([
    listDespesas(),
    listReceitas(),
    listCategorias(),
  ]);

  const categoriaMap = new Map<string, Categoria>(
    categorias.map((c) => [c.id, c])
  );

  // Filtragem no período
  const despesasNoPeriodo = allDespesas.filter(
    (d) => d.data >= fromISO && d.data <= toISO
  );
  const receitasNoPeriodo = allReceitas.filter(
    (r) => r.data >= fromISO && r.data <= toISO
  );

  const totalReceitas = receitasNoPeriodo.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = despesasNoPeriodo.reduce((sum, d) => sum + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const gastosNoCartao = despesasNoPeriodo
    .filter((d) => d.cartaoCredito)
    .reduce((sum, d) => sum + d.valor, 0);
  const gastosForaCartao = totalDespesas - gastosNoCartao;

  const despesasRecorrentes = despesasNoPeriodo
    .filter((d) => d.recorrente)
    .reduce((sum, d) => sum + d.valor, 0);
  const despesasAvulsas = totalDespesas - despesasRecorrentes;

  // Agrupamento por categoria de despesas
  const catTotalsMap = new Map<string, number>();
  despesasNoPeriodo.forEach((d) => {
    const prev = catTotalsMap.get(d.categoriaId) ?? 0;
    catTotalsMap.set(d.categoriaId, prev + d.valor);
  });

  const categoriasDespesa: CategorySummary[] = Array.from(catTotalsMap.entries())
    .map(([catId, total]) => {
      const cat = categoriaMap.get(catId);
      const percentual =
        totalDespesas > 0 ? Math.round((total / totalDespesas) * 100) : 0;
      return {
        categoriaId: catId,
        nome: cat?.nome ?? "Outros",
        cor: cat?.cor ?? "#64748B",
        icone: cat?.icone ?? "more-horizontal",
        total,
        percentual,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Agrupamento de cartão de crédito por categoria
  const cartaoCatMap = new Map<string, number>();
  despesasNoPeriodo
    .filter((d) => d.cartaoCredito)
    .forEach((d) => {
      const prev = cartaoCatMap.get(d.categoriaId) ?? 0;
      cartaoCatMap.set(d.categoriaId, prev + d.valor);
    });

  const cartaoPorCategoria: CategorySummary[] = Array.from(
    cartaoCatMap.entries()
  )
    .map(([catId, total]) => {
      const cat = categoriaMap.get(catId);
      const percentual =
        gastosNoCartao > 0 ? Math.round((total / gastosNoCartao) * 100) : 0;
      return {
        categoriaId: catId,
        nome: cat?.nome ?? "Outros",
        cor: cat?.cor ?? "#64748B",
        icone: cat?.icone ?? "more-horizontal",
        total,
        percentual,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    totalReceitas,
    totalDespesas,
    saldo,
    gastosNoCartao,
    gastosForaCartao,
    despesasRecorrentes,
    despesasAvulsas,
    categoriasDespesa,
    cartaoPorCategoria,
  };
}
