import { LocalCollection, withTimestamps } from "./localCollection";
import { auth } from "../config/firebase";
import type { Contribuicao, Meta } from "../types";

const metasCollection = new LocalCollection<Meta>("metas");
const contribuicoesCollection = new LocalCollection<Contribuicao>("contribuicoes");

export function listMetas(): Promise<Meta[]> {
  return metasCollection.getAll();
}

export function getMeta(id: string): Promise<Meta | null> {
  return metasCollection.getById(id);
}

interface CreateMetaInput {
  nome: string;
  valorObjetivo: number;
  dataLimite?: string | null;
  descricao?: string;
}

export function createMeta(input: CreateMetaInput): Promise<Meta> {
  return metasCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      valorAtual: 0,
      dataLimite: null,
      ...input,
    })
  );
}

export function updateMeta(
  id: string,
  patch: Partial<CreateMetaInput>
): Promise<Meta> {
  return metasCollection.update(id, withTimestamps(patch, true));
}

export async function deleteMeta(id: string): Promise<void> {
  await metasCollection.remove(id);
  const contribuicoes = await contribuicoesCollection.getAll();
  const restantes = contribuicoes.filter((c) => c.metaId !== id);
  await contribuicoesCollection.replaceAll(restantes);
}

export function listContribuicoes(metaId: string): Promise<Contribuicao[]> {
  return contribuicoesCollection
    .getAll()
    .then((items) => items.filter((c) => c.metaId === metaId));
}

interface AddContribuicaoInput {
  metaId: string;
  valor: number;
  data: string;
  observacao?: string;
}

/**
 * Adiciona uma contribuição e atualiza o `valorAtual` da meta (regra de
 * negócio #10). Localmente não há transação atômica real do Firestore,
 * mas como o JS roda em single-thread aqui, a sequência abaixo não sofre
 * concorrência — quando migrarmos para o Firestore, isso vira um
 * `runTransaction`/`writeBatch` real.
 */
export async function addContribuicao(
  input: AddContribuicaoInput
): Promise<{ contribuicao: Contribuicao; meta: Meta }> {
  const meta = await metasCollection.getById(input.metaId);
  if (!meta) {
    throw new Error(`Meta "${input.metaId}" não encontrada`);
  }

  const contribuicao = await contribuicoesCollection.create(
    withTimestamps({
      metaId: input.metaId,
      valor: input.valor,
      data: input.data,
      observacao: input.observacao,
    })
  );

  const metaAtualizada = await metasCollection.update(
    input.metaId,
    withTimestamps({ valorAtual: meta.valorAtual + input.valor }, true)
  );

  return { contribuicao, meta: metaAtualizada };
}

export async function deleteContribuicao(id: string): Promise<void> {
  const contribuicao = await contribuicoesCollection.getById(id);
  if (!contribuicao) return;

  const meta = await metasCollection.getById(contribuicao.metaId);
  await contribuicoesCollection.remove(id);

  if (meta) {
    await metasCollection.update(
      meta.id,
      withTimestamps({ valorAtual: meta.valorAtual - contribuicao.valor }, true)
    );
  }
}
