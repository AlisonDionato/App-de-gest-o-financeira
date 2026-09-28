import { useCallback, useEffect, useState } from "react";
import { listContas } from "../services/accounts.service";
import type { Conta } from "../types";

export function useContas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return listContas()
      .then(setContas)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { contas, loading, reload };
}
