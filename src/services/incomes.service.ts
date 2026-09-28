import { LocalCollection, withTimestamps } from "./localCollection";
import { auth } from "../config/firebase";
import type { Receita, ReceitaTipo } from "../types";

const receitasCollection = new LocalCollection<Receita>("receitas");

export function listReceitas(): Promise<Receita[]> {
  return receitasCollection.getAll();
}

export function getReceita(id: string): Promise<Receita | null> {
  return receitasCollection.getById(id);
}

interface CreateReceitaInput {
  descricao: string;
  valor: number;
  categoriaId: string;
  data: string;
  tipo: ReceitaTipo;
  recorrente?: boolean;
  observacao?: string;
}

export function createReceita(input: CreateReceitaInput): Promise<Receita> {
  return receitasCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      recorrente: false,
      ...input,
    })
  );
}

export function updateReceita(
  id: string,
  patch: Partial<CreateReceitaInput>
): Promise<Receita> {
  return receitasCollection.update(id, withTimestamps(patch, true));
}

export function deleteReceita(id: string): Promise<void> {
  return receitasCollection.remove(id);
}

/** Total de receitas em um intervalo de datas (ISO), usado no saldo (seção 12). */
export async function sumReceitas(
  fromISO?: string,
  toISO?: string
): Promise<number> {
  const receitas = await receitasCollection.getAll();
  return receitas
    .filter((r) => (!fromISO || r.data >= fromISO) && (!toISO || r.data <= toISO))
    .reduce((total, r) => total + r.valor, 0);
}
