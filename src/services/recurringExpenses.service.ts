import { LocalCollection, withTimestamps } from "./localCollection";
import { auth } from "../config/firebase";
import {
  createDespesa,
  listDespesasByRecurringId,
  updateDespesa,
} from "./expenses.service";
import type {
  DespesaRecorrente,
  Periodicidade,
  RecurringEditScope,
} from "../types";

const recorrentesCollection = new LocalCollection<DespesaRecorrente>(
  "despesas_recorrentes"
);

export function listDespesasRecorrentes(): Promise<DespesaRecorrente[]> {
  return recorrentesCollection.getAll();
}

export function getDespesaRecorrente(
  id: string
): Promise<DespesaRecorrente | null> {
  return recorrentesCollection.getById(id);
}

interface CreateRecorrenteInput {
  descricao: string;
  valor: number;
  categoriaId: string;
  contaId: string;
  dataInicio: string;
  periodicidade: Periodicidade;
  diaVencimento: number;
  cartaoCredito: boolean;
}

export async function createDespesaRecorrente(
  input: CreateRecorrenteInput
): Promise<DespesaRecorrente> {
  const regra = await recorrentesCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      dataFim: null,
      ativa: "ativa",
      ...input,
    })
  );
  // Gera imediatamente a ocorrência do período atual, se já for devida —
  // assim o usuário não precisa esperar o próximo mês para ver o efeito.
  await ensureOccurrenceForRule(regra);
  return regra;
}

/**
 * Edita os dados de uma recorrência, respeitando o escopo escolhido
 * (seção 8: "deixar claro se a alteração deverá afetar apenas a ocorrência
 * atual, as próximas ou todas"):
 *
 * - "atual": só altera a despesa já gerada para o período atual (gera uma
 *   se ainda não existir), sem tocar na regra — as próximas ocorrências
 *   continuam usando os valores antigos da regra.
 * - "futuras": altera a regra; ocorrências já geradas no passado
 *   permanecem como estão, só as próximas usarão os novos valores.
 * - "todas": altera a regra E atualiza retroativamente todas as
 *   ocorrências já geradas por ela.
 */
export async function editDespesaRecorrente(
  id: string,
  patch: Partial<CreateRecorrenteInput>,
  scope: RecurringEditScope
): Promise<DespesaRecorrente> {
  const regra = await recorrentesCollection.getById(id);
  if (!regra) {
    throw new Error(`Despesa recorrente "${id}" não encontrada`);
  }

  const despesaPatch = extractDespesaPatch(patch);

  if (scope === "atual") {
    if (Object.keys(despesaPatch).length > 0) {
      const ocorrencia = await ensureOccurrenceForRule(regra);
      if (ocorrencia) {
        await updateDespesa(ocorrencia.id, despesaPatch);
      }
    }
    return regra;
  }

  const regraAtualizada = await recorrentesCollection.update(
    id,
    withTimestamps(patch, true)
  );

  if (scope === "todas" && Object.keys(despesaPatch).length > 0) {
    const geradas = await listDespesasByRecurringId(id);
    for (const despesa of geradas) {
      await updateDespesa(despesa.id, despesaPatch);
    }
  }

  return regraAtualizada;
}

/** Só os campos que também existem em Despesa (a regra tem outros campos que não se aplicam a uma ocorrência já gerada). */
function extractDespesaPatch(patch: Partial<CreateRecorrenteInput>) {
  const { descricao, valor, categoriaId, contaId, cartaoCredito } = patch;
  const result: Record<string, unknown> = {};
  if (descricao !== undefined) result.descricao = descricao;
  if (valor !== undefined) result.valor = valor;
  if (categoriaId !== undefined) result.categoriaId = categoriaId;
  if (contaId !== undefined) result.contaId = contaId;
  if (cartaoCredito !== undefined) result.cartaoCredito = cartaoCredito;
  return result;
}

export function pausarDespesaRecorrente(id: string): Promise<DespesaRecorrente> {
  return recorrentesCollection.update(id, withTimestamps({ ativa: "pausada" }, true));
}

export function retomarDespesaRecorrente(id: string): Promise<DespesaRecorrente> {
  return recorrentesCollection.update(id, withTimestamps({ ativa: "ativa" }, true));
}

export function encerrarDespesaRecorrente(id: string): Promise<DespesaRecorrente> {
  return recorrentesCollection.update(
    id,
    withTimestamps({ ativa: "encerrada", dataFim: new Date().toISOString() }, true)
  );
}

/**
 * Exclui a regra permanentemente. As despesas já geradas por ela NÃO são
 * apagadas — viram despesas avulsas normais no histórico/extrato, só
 * deixam de ser geradas automaticamente a partir de agora. Preserva o
 * histórico financeiro do usuário, evitando perda de dados (seção 16).
 */
export function deleteDespesaRecorrente(id: string): Promise<void> {
  return recorrentesCollection.remove(id);
}

/**
 * Soma o valor das regras de despesas recorrentes ativas (projeção da
 * regra, não das ocorrências já geradas). Não é mais usada no cálculo do
 * saldo (`balance.service.ts`) — desde que o motor de ocorrências passou a
 * gerar despesas reais, usar esta soma ali causaria contagem duplicada.
 * Mantida como utilitário para uma eventual tela de projeção futura.
 */
export async function sumDespesasRecorrentesAtivas(): Promise<number> {
  const recorrentes = await recorrentesCollection.getAll();
  return recorrentes
    .filter((r) => r.ativa === "ativa")
    .reduce((total, r) => total + r.valor, 0);
}

// ---------------------------------------------------------------------------
// Motor de geração de ocorrências (seção 8, regra de negócio #4)
// ---------------------------------------------------------------------------

/**
 * Chave que identifica um período de recorrência (ex.: "2026-09" para
 * mensal). Usada para não gerar a mesma ocorrência duas vezes.
 *
 * A recorrência semanal usa um contador de semanas desde uma época fixa
 * (1970-01-01) — uma simplificação intencional, documentada aqui, que
 * evita a complexidade de semanas ISO; suficiente para não duplicar
 * ocorrências. Pode ser refinada quando houver necessidade real.
 */
function getPeriodKey(date: Date, periodicidade: Periodicidade): string {
  if (periodicidade === "anual") {
    return String(date.getFullYear());
  }
  if (periodicidade === "semanal") {
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
    const weekIndex = Math.floor(date.getTime() / MS_PER_WEEK);
    return `W${weekIndex}`;
  }
  // mensal (padrão)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/** Calcula a data da ocorrência dentro do período atual, a partir do diaVencimento da regra. */
function computeOccurrenceDate(
  regra: DespesaRecorrente,
  referenceDate: Date
): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  if (regra.periodicidade === "anual") {
    const inicio = new Date(regra.dataInicio);
    const day = Math.min(regra.diaVencimento, daysInMonth(year, inicio.getMonth()));
    return new Date(year, inicio.getMonth(), day);
  }

  if (regra.periodicidade === "semanal") {
    // diaVencimento representa o dia da semana (1 = domingo ... 7 = sábado).
    const targetWeekday = Math.min(Math.max(regra.diaVencimento, 1), 7) - 1;
    const diff = targetWeekday - referenceDate.getDay();
    const result = new Date(referenceDate);
    result.setDate(referenceDate.getDate() + diff);
    return result;
  }

  // mensal (padrão)
  const day = Math.min(regra.diaVencimento, daysInMonth(year, month));
  return new Date(year, month, day);
}

/**
 * Garante que a ocorrência do período atual de uma regra específica exista
 * como um registro em `despesas` — cria se ainda não existir. Retorna a
 * ocorrência (existente ou recém-criada), ou `null` se a regra não estiver
 * ativa ou o período atual estiver fora do intervalo dataInicio/dataFim.
 */
async function ensureOccurrenceForRule(
  regra: DespesaRecorrente
): Promise<{ id: string } | null> {
  if (regra.ativa !== "ativa") return null;

  const hoje = new Date();
  const inicio = new Date(regra.dataInicio);
  if (inicio > hoje) return null;
  if (regra.dataFim && new Date(regra.dataFim) < hoje) return null;

  const periodKey = getPeriodKey(hoje, regra.periodicidade);

  const geradas = await listDespesasByRecurringId(regra.id);
  const existente = geradas.find((d) => d.recurringPeriodKey === periodKey);
  if (existente) return existente;

  const dataOcorrencia = computeOccurrenceDate(regra, hoje);

  const novaDespesa = await createDespesa({
    descricao: regra.descricao,
    valor: regra.valor,
    categoriaId: regra.categoriaId,
    contaId: regra.contaId,
    cartaoCredito: regra.cartaoCredito,
    data: dataOcorrencia.toISOString(),
    recorrente: true,
    recurringConfigId: regra.id,
    recurringPeriodKey: periodKey,
  });

  return novaDespesa;
}

/**
 * Ponto de entrada do motor: garante a ocorrência do período atual para
 * todas as regras ativas. Chamado na inicialização do app (`App.tsx`).
 * Idempotente — pode ser chamado quantas vezes for preciso sem duplicar.
 */
export async function ensureCurrentPeriodOccurrences(): Promise<void> {
  const regras = await recorrentesCollection.getAll();
  for (const regra of regras.filter((r) => r.ativa === "ativa")) {
    await ensureOccurrenceForRule(regra);
  }
}
