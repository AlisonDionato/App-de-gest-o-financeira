import { LocalCollection, withTimestamps } from "./localCollection";
import { auth } from "../config/firebase";
import type { Conta, ContaTipo } from "../types";

const contasCollection = new LocalCollection<Conta>("contas");

/**
 * Garante que exista ao menos uma conta ("Carteira"). O módulo completo de
 * Contas (cadastro, edição, exclusão) é a Etapa 6; mas o formulário de
 * Despesas (Etapa 4) exige um `contaId` desde já (seção 6), então criamos
 * uma conta padrão na primeira execução para não bloquear o cadastro de
 * despesas. Quando a Etapa 6 for implementada, o usuário poderá renomear,
 * editar ou criar outras contas normalmente.
 */
export async function ensureDefaultAccount(): Promise<void> {
  const existing = await contasCollection.getAll();
  if (existing.length > 0) return;

  await contasCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      nome: "Carteira",
      tipo: "carteira",
      saldoInicial: 0,
      saldoAtual: 0,
    })
  );
}

export function listContas(): Promise<Conta[]> {
  return contasCollection.getAll();
}

export function getConta(id: string): Promise<Conta | null> {
  return contasCollection.getById(id);
}

interface CreateContaInput {
  nome: string;
  tipo: ContaTipo;
  saldoInicial: number;
}

export function createConta(input: CreateContaInput): Promise<Conta> {
  return contasCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      nome: input.nome,
      tipo: input.tipo,
      saldoInicial: input.saldoInicial,
      saldoAtual: input.saldoInicial,
    })
  );
}

export function updateConta(
  id: string,
  patch: Partial<Pick<Conta, "nome" | "tipo">>
): Promise<Conta> {
  return contasCollection.update(id, withTimestamps(patch, true));
}

/**
 * Ajusta o saldo atual de uma conta em `delta` (positivo ou negativo).
 * Usado pelos serviços de receitas/despesas ao criar, editar ou excluir
 * uma movimentação vinculada a uma conta.
 */
export async function adjustContaBalance(id: string, delta: number): Promise<Conta> {
  const conta = await contasCollection.getById(id);
  if (!conta) {
    throw new Error(`Conta "${id}" não encontrada`);
  }
  return contasCollection.update(
    id,
    withTimestamps({ saldoAtual: conta.saldoAtual + delta }, true)
  );
}

export function deleteConta(id: string): Promise<void> {
  return contasCollection.remove(id);
}
