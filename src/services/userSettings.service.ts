import { readJSON, writeJSON } from "./localStorage";
import type { RendaPrincipal } from "../types";

const SETTINGS_KEY = "renda_principal";

export function getRendaPrincipal(): Promise<RendaPrincipal | null> {
  return readJSON<RendaPrincipal>(SETTINGS_KEY);
}

/**
 * Salva a configuração de renda principal (Onboarding, seção 4). Chamado
 * tanto no cadastro inicial quanto em uma futura edição pelo Perfil.
 */
export function saveRendaPrincipal(input: RendaPrincipal): Promise<void> {
  return writeJSON(SETTINGS_KEY, input);
}
