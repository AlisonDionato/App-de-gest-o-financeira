import { useCallback, useEffect, useState } from "react";
import { listDespesasRecorrentes } from "../services/recurringExpenses.service";
import type { DespesaRecorrente } from "../types";

export function useDespesasRecorrentes() {
  const [recorrentes, setRecorrentes] = useState<DespesaRecorrente[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return listDespesasRecorrentes()
      .then(setRecorrentes)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { recorrentes, loading, reload };
}
