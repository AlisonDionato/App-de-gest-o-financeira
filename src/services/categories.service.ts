import { LocalCollection, withTimestamps } from "./localCollection";
import { auth } from "../config/firebase";
import type { Categoria, CategoriaTipo } from "../types";

const categoriasCollection = new LocalCollection<Categoria>("categorias");

/** Categorias padrão do sistema (seção 9). Criadas na primeira vez que o app roda. */
const DEFAULT_CATEGORIES: Array<Pick<Categoria, "nome" | "tipo" | "icone" | "cor">> = [
  { nome: "Alimentação", tipo: "despesa", icone: "coffee", cor: "#D97706" },
  { nome: "Moradia", tipo: "despesa", icone: "home", cor: "#2563EB" },
  { nome: "Transporte", tipo: "despesa", icone: "truck", cor: "#0EA5E9" },
  { nome: "Saúde", tipo: "despesa", icone: "heart", cor: "#DC2626" },
  { nome: "Educação", tipo: "despesa", icone: "book-open", cor: "#7C3AED" },
  { nome: "Lazer", tipo: "despesa", icone: "smile", cor: "#DB2777" },
  { nome: "Compras", tipo: "despesa", icone: "shopping-bag", cor: "#EA580C" },
  { nome: "Assinaturas", tipo: "despesa", icone: "repeat", cor: "#4F46E5" },
  { nome: "Contas", tipo: "despesa", icone: "file-text", cor: "#0D9488" },
  { nome: "Outros", tipo: "despesa", icone: "more-horizontal", cor: "#64748B" },
  { nome: "Salário", tipo: "receita", icone: "briefcase", cor: "#16A34A" },
  { nome: "Outras receitas", tipo: "receita", icone: "plus-circle", cor: "#16A34A" },
];

/**
 * Garante que as categorias padrão existam. Idempotente: se já houver
 * categorias cadastradas (padrão ou personalizadas), não faz nada.
 * Chamado uma vez na inicialização do app (ver App.tsx).
 */
export async function ensureDefaultCategories(): Promise<void> {
  const existing = await categoriasCollection.getAll();
  if (existing.length > 0) return;

  for (const categoria of DEFAULT_CATEGORIES) {
    await categoriasCollection.create(
      withTimestamps({
        userId: auth.currentUser?.uid ?? null,
        isCustom: false,
        ...categoria,
      })
    );
  }
}

export function listCategorias(tipo?: CategoriaTipo): Promise<Categoria[]> {
  return categoriasCollection
    .getAll()
    .then((items) => (tipo ? items.filter((c) => c.tipo === tipo) : items));
}

export function getCategoria(id: string): Promise<Categoria | null> {
  return categoriasCollection.getById(id);
}

interface CreateCategoriaInput {
  nome: string;
  tipo: CategoriaTipo;
  icone: string;
  cor: string;
}

/** Cria uma categoria personalizada do usuário (regra: pertence ao usuário quando custom). */
export function createCategoria(input: CreateCategoriaInput): Promise<Categoria> {
  return categoriasCollection.create(
    withTimestamps({
      userId: auth.currentUser?.uid ?? null,
      isCustom: true,
      ...input,
    })
  );
}

export function updateCategoria(
  id: string,
  patch: Partial<CreateCategoriaInput>
): Promise<Categoria> {
  return categoriasCollection.update(id, withTimestamps(patch, true));
}

export function deleteCategoria(id: string): Promise<void> {
  return categoriasCollection.remove(id);
}
