import { LocalCollection, withTimestamps } from "./localCollection";
import { adjustContaBalance } from "./accounts.service";
import { auth } from "../config/firebase";
import type { Despesa } from "../types";

const despesasCollection = new LocalCollection<Despesa>("despesas");

export function listDespesas(): Promise<Despesa[]> {
  return despesasCollection.getAll();
}

export function getDespesa(id: string): Promise<Despesa | null> {
  return despesasCollection.getById(id);
}

/** Despesas já geradas a partir de uma regra recorrente específica (seção 8). */
export async function listDespesasByRecurringId(
  recurringConfigId: string
): Promise<Despesa[]> {
  const despesas = await despesasCollection.getAll();
  return despesas.filter((d) => d.recurringConfigId === recurringConfigId);
}

interface CreateDespesaInput {
  descricao: string;
  valor: number;
  categoriaId: string;
  data: string;
  contaId: string;
  cartaoCredito: boolean;
  recorrente?: boolean;
  tipo?: string;
  observacao?: string;
  recurringConfigId?: string | null;
  recurringPeriodKey?: string | null;
}

/** Cria a despesa e debita o valor da conta vinculada. */
export async function createDespesa(input: CreateDespesaInput): Promise<Despesa> {
  const despesa = await despesasCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      recorrente: false,
      tipo: "padrao",
      ...input,
    })
  );
  await adjustContaBalance(input.contaId, -input.valor);
  return despesa;
}

/**
 * Edita uma despesa. Se o valor ou a conta mudarem, reverte o efeito
 * anterior no saldo da conta antiga e aplica o novo na conta atual —
 * evita saldo inconsistente entre contas ao editar.
 */
export async function updateDespesa(
  id: string,
  patch: Partial<CreateDespesaInput>
): Promise<Despesa> {
  const anterior = await despesasCollection.getById(id);
  if (!anterior) {
    throw new Error(`Despesa "${id}" não encontrada`);
  }

  const novaContaId = patch.contaId ?? anterior.contaId;
  const novoValor = patch.valor ?? anterior.valor;

  if (novaContaId !== anterior.contaId) {
    await adjustContaBalance(anterior.contaId, anterior.valor); // devolve à conta antiga
    await adjustContaBalance(novaContaId, -novoValor); // debita da conta nova
  } else if (novoValor !== anterior.valor) {
    await adjustContaBalance(anterior.contaId, anterior.valor - novoValor);
  }

  return despesasCollection.update(id, withTimestamps(patch, true));
}

/** Exclui a despesa e devolve o valor para a conta vinculada. */
export async function deleteDespesa(id: string): Promise<void> {
  const despesa = await despesasCollection.getById(id);
  if (!despesa) return;
  await despesasCollection.remove(id);
  await adjustContaBalance(despesa.contaId, despesa.valor);
}

interface DespesasSummary {
  total: number;
  noCartao: number;
  foraDoCartao: number;
  /** Parte do total que veio de despesas recorrentes já geradas (seção 15). */
  recorrentes: number;
}

/**
 * Total de despesas em um intervalo de datas (ISO), segmentado por cartão
 * de crédito (regra de negócio #3/#7 e seção 12) e por origem recorrente.
 */
export async function sumDespesas(
  fromISO?: string,
  toISO?: string
): Promise<DespesasSummary> {
  const despesas = await despesasCollection.getAll();
  const noPeriodo = despesas.filter(
    (d) => (!fromISO || d.data >= fromISO) && (!toISO || d.data <= toISO)
  );

  const noCartao = noPeriodo
    .filter((d) => d.cartaoCredito)
    .reduce((total, d) => total + d.valor, 0);
  const foraDoCartao = noPeriodo
    .filter((d) => !d.cartaoCredito)
    .reduce((total, d) => total + d.valor, 0);
  const recorrentes = noPeriodo
    .filter((d) => d.recorrente)
    .reduce((total, d) => total + d.valor, 0);

  return { total: noCartao + foraDoCartao, noCartao, foraDoCartao, recorrentes };
}
