/**
 * Gera um identificador único localmente (timestamp + parte aleatória).
 * Evita adicionar uma dependência (ex.: uuid) só para isso — quando os
 * dados forem migrados para o Firestore, os IDs gerados no cliente
 * (`doc(collection).id`) assumem o mesmo papel.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${random}`;
}
