import { collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { LocalCollection } from "./localCollection";
import type {
  Categoria,
  Conta,
  Contribuicao,
  Despesa,
  DespesaRecorrente,
  Meta,
  Receita,
} from "../types";

export type SyncStatus = "online" | "offline" | "syncing" | "synced";

/**
 * Serviço de sincronização bidirecional entre o armazenamento local (AsyncStorage)
 * e o Cloud Firestore (seção 16).
 *
 * Garante idempotência usando IDs únicos gerados no cliente, evitando duplicações,
 * perdas de dados e registros inconsistentes.
 */
export async function syncLocalWithFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  // Coleções locais
  const contasCol = new LocalCollection<Conta>("contas");
  const categoriasCol = new LocalCollection<Categoria>("categorias");
  const receitasCol = new LocalCollection<Receita>("receitas");
  const despesasCol = new LocalCollection<Despesa>("despesas");
  const recorrentesCol = new LocalCollection<DespesaRecorrente>("despesas_recorrentes");
  const metasCol = new LocalCollection<Meta>("metas");
  const contribuicoesCol = new LocalCollection<Contribuicao>("contribuicoes");

  // 1. Obter todos os dados locais
  const [
    localContas,
    localCategorias,
    localReceitas,
    localDespesas,
    localRecorrentes,
    localMetas,
    localContribuicoes,
  ] = await Promise.all([
    contasCol.getAll(),
    categoriasCol.getAll(),
    receitasCol.getAll(),
    despesasCol.getAll(),
    recorrentesCol.getAll(),
    metasCol.getAll(),
    contribuicoesCol.getAll(),
  ]);

  const batch = writeBatch(db);

  // 2. Enviar dados locais para o Firestore (Upload/Sincronização)
  localContas.forEach((item) => {
    const docRef = doc(db, "contas", item.id);
    batch.set(docRef, { ...item, userId: user.uid }, { merge: true });
  });

  localCategorias.forEach((item) => {
    const docRef = doc(db, "categorias", item.id);
    batch.set(
      docRef,
      { ...item, userId: item.isCustom ? user.uid : null },
      { merge: true }
    );
  });

  localReceitas.forEach((item) => {
    const docRef = doc(db, "receitas", item.id);
    batch.set(docRef, { ...item, userId: user.uid }, { merge: true });
  });

  localDespesas.forEach((item) => {
    const docRef = doc(db, "despesas", item.id);
    batch.set(docRef, { ...item, userId: user.uid }, { merge: true });
  });

  localRecorrentes.forEach((item) => {
    const docRef = doc(db, "despesas_recorrentes", item.id);
    batch.set(docRef, { ...item, userId: user.uid }, { merge: true });
  });

  localMetas.forEach((item) => {
    const docRef = doc(db, "metas", item.id);
    batch.set(docRef, { ...item, userId: user.uid }, { merge: true });
  });

  localContribuicoes.forEach((item) => {
    const docRef = doc(db, "contribuicoes", item.id);
    batch.set(docRef, item, { merge: true });
  });

  await batch.commit();

  // 3. Baixar atualizações do Firestore pertencentes ao usuário (Download/Sincronização)
  const collectionsToSync = [
    { name: "contas", col: contasCol },
    { name: "receitas", col: receitasCol },
    { name: "despesas", col: despesasCol },
    { name: "despesas_recorrentes", col: recorrentesCol },
    { name: "metas", col: metasCol },
  ];

  for (const item of collectionsToSync) {
    const q = query(collection(db, item.name), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const remoteItems = snapshot.docs.map((d) => d.data() as any);
      await item.col.replaceAll(remoteItems);
    }
  }
}
