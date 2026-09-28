import { getRendaPrincipal } from "./userSettings.service";
import { sumReceitas } from "./incomes.service";
import { sumDespesas } from "./expenses.service";

export interface BalanceSummary {
  salario: number;
  outrasReceitas: number;
  totalReceitas: number;
  despesas: number;
  /** Parte de `despesas` que veio de despesas recorrentes já geradas (informativo, não soma de novo). */
  despesasRecorrentes: number;
  gastosCartao: number;
  saldoDisponivel: number;
}

/**
 * Calcula o resumo financeiro do período (seção 12):
 * Saldo = Total de receitas - Total de despesas.
 *
 * Desde a Etapa 5, despesas recorrentes ativas já geram registros reais em
 * `despesas` (ver `recurringExpenses.service.ts`), então `despesas` já as
 * inclui — `despesasRecorrentes` aqui é só informativo (quanto do total é
 * recorrente), e NÃO é somado de novo ao saldo, para não contar duas vezes.
 *
 * `outrasReceitas` soma o que está cadastrado em `receitas`; o salário vem
 * separadamente da configuração de renda principal (seção 4), pois ainda
 * não é lançado como um registro de receita recorrente automático — o
 * motor de recorrências (Etapa 5) cobre despesas; estender para receitas
 * recorrentes fica para quando isso for pedido (seção 23).
 */
export async function getBalanceSummary(
  fromISO?: string,
  toISO?: string
): Promise<BalanceSummary> {
  const [rendaPrincipal, outrasReceitas, despesasSummary] = await Promise.all([
    getRendaPrincipal(),
    sumReceitas(fromISO, toISO),
    sumDespesas(fromISO, toISO),
  ]);

  const salario = rendaPrincipal?.salario ?? 0;
  const totalReceitas = salario + outrasReceitas;

  return {
    salario,
    outrasReceitas,
    totalReceitas,
    despesas: despesasSummary.total,
    despesasRecorrentes: despesasSummary.recorrentes,
    gastosCartao: despesasSummary.noCartao,
    saldoDisponivel: totalReceitas - despesasSummary.total,
  };
}
