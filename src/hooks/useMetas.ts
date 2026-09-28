import { useCallback, useEffect, useState } from "react";
import { listMetas } from "../services/goals.service";
import type { Meta } from "../types";

export function useMetas() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return listMetas()
      .then(setMetas)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { metas, loading, reload };
}
