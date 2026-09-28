import { generateId } from "../utils/id";
import { readJSON, writeJSON } from "./localStorage";

interface BaseEntity {
  id: string;
}

interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

/**
 * Repositório CRUD genérico sobre uma "coleção" local (uma chave do
 * AsyncStorage guardando um array em JSON). A interface pública
 * (getAll/getById/create/update/remove) é intencionalmente próxima da que
 * uma coleção do Firestore ofereceria, para que os serviços de domínio que
 * a consomem não precisem mudar quando o backend for trocado.
 */
export class LocalCollection<T extends BaseEntity> {
  constructor(private readonly storageKey: string) {}

  async getAll(): Promise<T[]> {
    const items = await readJSON<T[]>(this.storageKey);
    return items ?? [];
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.getAll();
    return items.find((item) => item.id === id) ?? null;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const items = await this.getAll();
    const newItem = { ...data, id: generateId() } as T;
    await writeJSON(this.storageKey, [...items, newItem]);
    return newItem;
  }

  async update(id: string, patch: Partial<Omit<T, "id">>): Promise<T> {
    const items = await this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Registro "${id}" não encontrado em "${this.storageKey}"`);
    }
    const updated = { ...items[index], ...patch } as T;
    const next = [...items];
    next[index] = updated;
    await writeJSON(this.storageKey, next);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const items = await this.getAll();
    await writeJSON(
      this.storageKey,
      items.filter((item) => item.id !== id)
    );
  }

  /** Substitui a coleção inteira — usado por operações que afetam vários registros de uma vez. */
  async replaceAll(items: T[]): Promise<void> {
    await writeJSON(this.storageKey, items);
  }
}

/** Aplica createdAt/updatedAt automaticamente — usado pelos serviços de domínio. */
export function withTimestamps<T extends object>(
  data: T,
  isUpdate = false
): T & WithTimestamps {
  const now = new Date().toISOString();
  const existingCreatedAt =
    "createdAt" in data && typeof (data as Record<string, unknown>).createdAt === "string"
      ? ((data as Record<string, unknown>).createdAt as string)
      : undefined;

  return {
    ...data,
    createdAt: isUpdate ? (existingCreatedAt ?? now) : now,
    updatedAt: now,
  };
}

