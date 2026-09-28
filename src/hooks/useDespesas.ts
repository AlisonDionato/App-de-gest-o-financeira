import { useCallback, useEffect, useState } from "react";
import { listDespesas } from "../services/expenses.service";
import type { Despesa } from "../types";

export function useDespesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return listDespesas()
      .then((items) =>
        setDespesas([...items].sort((a, b) => (a.data < b.data ? 1 : -1)))
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { despesas, loading, reload };
}
