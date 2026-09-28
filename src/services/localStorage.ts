/**
 * Configuração do armazenamento local.
 *
 * Enquanto o projeto Firebase não existe, este módulo é o "banco de dados"
 * da aplicação: todas as entidades (contas, categorias, receitas, despesas,
 * recorrências, metas) são persistidas aqui via AsyncStorage, no formato
 * JSON, sob uma chave por coleção (ver `localCollection.ts`).
 *
 * Quando o Firestore for configurado, `LocalCollection<T>` (a próxima
 * camada) será substituída por uma implementação equivalente sobre o
 * Firestore, mantendo a mesma interface (getAll/getById/create/update/
 * remove) — as telas e os serviços de domínio não precisarão mudar.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "@gestao_financeira/";

export class LocalStorageError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "LocalStorageError";
    if (cause) {
      // eslint-disable-next-line no-console
      console.error(message, cause);
    }
  }
}

export async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    throw new LocalStorageError(`Falha ao ler "${key}" do armazenamento local`, error);
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    throw new LocalStorageError(
      `Falha ao gravar "${key}" no armazenamento local`,
      error
    );
  }
}

export async function removeJSON(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    throw new LocalStorageError(
      `Falha ao remover "${key}" do armazenamento local`,
      error
    );
  }
}

/** Apaga todos os dados do app do armazenamento local (usado em testes/reset). */
export async function clearAllLocalData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith(STORAGE_PREFIX));
  await AsyncStorage.multiRemove(appKeys);
}
