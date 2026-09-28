import { useCallback, useEffect, useState } from "react";
import { listReceitas } from "../services/incomes.service";
import type { Receita } from "../types";

export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return listReceitas()
      .then((items) =>
        setReceitas([...items].sort((a, b) => (a.data < b.data ? 1 : -1)))
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { receitas, loading, reload };
}
