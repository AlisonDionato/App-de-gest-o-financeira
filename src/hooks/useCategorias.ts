import { useCallback, useEffect, useState } from "react";
import { listCategorias } from "../services/categories.service";
import type { Categoria, CategoriaTipo } from "../types";

/** Carrega as categorias (opcionalmente filtradas por receita/despesa). */
export function useCategorias(tipo?: CategoriaTipo) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return listCategorias(tipo)
      .then(setCategorias)
      .finally(() => setLoading(false));
  }, [tipo]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categorias, loading, reload };
}
