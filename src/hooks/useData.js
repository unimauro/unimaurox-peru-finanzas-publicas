import { useEffect, useState } from 'react';

// Hook genérico: ejecuta un cargador async y expone estados de carga/error
export function useData(cargador, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);
    cargador()
      .then((d) => {
        if (!cancelado) setData(d);
      })
      .catch((e) => {
        if (!cancelado) setError(e);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
