/**
 * Formatadores centralizados para o padrão brasileiro.
 * Usados em qualquer tela/componente que exiba valores monetários ou datas.
 */

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um número para o padrão monetário brasileiro: R$ 1.234,56 */
export function formatCurrency(value: number): string {
  if (Number.isNaN(value)) return currencyFormatter.format(0);
  return currencyFormatter.format(value);
}

/** Formata uma data (Date) para dd/MM/yyyy. */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Formata uma data por extenso curta, ex.: "22 de set." */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/**
 * Converte um texto digitado (ex.: em um input mascarado) para número.
 * Aceita formatos como "1.234,56" ou "1234,56".
 */
export function parseCurrencyInput(text: string): number {
  const normalized = text
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}
