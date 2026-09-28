import type { TextStyle } from "react-native";

/**
 * Hierarquia tipográfica do app. Usa as fontes padrão do sistema
 * (San Francisco no iOS, Roboto no Android) — evita a necessidade de
 * carregar e empacotar fontes customizadas nesta fase.
 */
export const typography = {
  displayLg: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
  } as TextStyle,
  displayMd: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  } as TextStyle,
  titleLg: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
  } as TextStyle,
  titleMd: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  } as TextStyle,
  bodyLg: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  } as TextStyle,
  bodyMd: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  } as TextStyle,
  bodySm: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  } as TextStyle,
  label: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 16,
  } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
