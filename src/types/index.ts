/**
 * Modelos de domínio da aplicação.
 *
 * Nesta fase (Etapa 3 local), `userId` existe em todas as entidades para já
 * deixar a estrutura pronta para o multi-tenant do Firestore mais adiante,
 * mas fica `null` enquanto não há autenticação (Etapa 2, ainda pendente).
 *
 * Datas são armazenadas como string ISO 8601 (compatível com
 * `JSON.stringify`/AsyncStorage; serão convertidas para `Timestamp` quando
 * migrarmos para o Firestore).
 */

export type ISODateString = string;

// ---------------------------------------------------------------------------
// Configuração inicial / Renda principal (seção 4)
// ---------------------------------------------------------------------------

export type Periodicidade = "semanal" | "mensal" | "anual";

export interface RendaPrincipal {
  salario: number;
  diaRecebimento: number; // dia do mês (1-31)
  descricao: string;
  periodicidade: Periodicidade;
}

// ---------------------------------------------------------------------------
// Categorias (seção 9)
// ---------------------------------------------------------------------------

export type CategoriaTipo = "receita" | "despesa";

export interface Categoria {
  id: string;
  userId: string | null;
  nome: string;
  tipo: CategoriaTipo;
  icone: string; // nome do ícone (Feather)
  cor: string; // cor hexadecimal, usada como identificação visual
  isCustom: boolean; // false = categoria padrão do sistema
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Contas (seção 10)
// ---------------------------------------------------------------------------

export type ContaTipo =
  | "corrente"
  | "poupanca"
  | "carteira"
  | "banco_digital"
  | "investimento";

export interface Conta {
  id: string;
  userId: string | null;
  nome: string;
  tipo: ContaTipo;
  saldoInicial: number;
  saldoAtual: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Receitas (seção 5)
// ---------------------------------------------------------------------------

/** Diferencia a renda principal das demais receitas (regra da seção 5). */
export type ReceitaTipo = "principal" | "extra";

export interface Receita {
  id: string;
  userId: string | null;
  descricao: string;
  valor: number;
  categoriaId: string;
  data: ISODateString;
  tipo: ReceitaTipo;
  recorrente: boolean;
  observacao?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Despesas (seção 6 e 7)
// ---------------------------------------------------------------------------

export interface Despesa {
  id: string;
  userId: string | null;
  descricao: string;
  valor: number;
  categoriaId: string;
  data: ISODateString;
  tipo: string; // reservado para classificação futura (ex.: fixa/variável)
  recorrente: boolean;
  cartaoCredito: boolean; // regra de negócio #6/#7
  contaId: string;
  observacao?: string;
  /** Preenchido quando esta despesa foi gerada automaticamente por uma recorrência (seção 8). */
  recurringConfigId?: string | null;
  /**
   * Chave do período em que a ocorrência foi gerada (ex.: "2026-09" para
   * mensal). Usada só internamente pelo motor de recorrências para evitar
   * gerar duas vezes a mesma ocorrência — não é exibida na UI.
   */
  recurringPeriodKey?: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------------------------------------------------------------------------
// Despesas recorrentes (seção 8)
// ---------------------------------------------------------------------------

export type RecorrenteStatus = "ativa" | "pausada" | "encerrada";

export interface DespesaRecorrente {
  id: string;
  userId: string | null;
  descricao: string;
  valor: number;
  categoriaId: string;
  dataInicio: ISODateString;
  dataFim: ISODateString | null;
  periodicidade: Periodicidade;
  diaVencimento: number;
  cartaoCredito: boolean;
  ativa: RecorrenteStatus;
  contaId: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Escopo de edição de uma recorrência (seção 8): "deixar claro se a
 * alteração deverá afetar apenas a ocorrência atual, as próximas ou todas".
 * O motor de geração/controle de ocorrências será implementado na Etapa 5;
 * este tipo já fica definido para não exigir alterações estruturais depois.
 */
export type RecurringEditScope = "atual" | "futuras" | "todas";

// ---------------------------------------------------------------------------
// Metas financeiras (seção 13)
// ---------------------------------------------------------------------------

export interface Meta {
  id: string;
  userId: string | null;
  nome: string;
  valorObjetivo: number;
  valorAtual: number;
  dataLimite: ISODateString | null;
  descricao?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Contribuicao {
  id: string;
  metaId: string;
  valor: number;
  data: ISODateString;
  observacao?: string;
  createdAt: ISODateString;
}
