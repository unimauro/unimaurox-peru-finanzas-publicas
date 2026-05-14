import { createContext, useContext, useMemo, useState } from 'react';

const FilterContext = createContext(null);

const ANIO_MIN = 1990;
const ANIO_MAX = 2025;

export function FilterProvider({ children }) {
  const [anio, setAnio] = useState(ANIO_MAX);
  const [region, setRegion] = useState('TODAS');
  const [unidad, setUnidad] = useState('millones'); // 'soles' | 'miles' | 'millones' | 'miles-millones'

  const value = useMemo(
    () => ({
      anio,
      setAnio,
      region,
      setRegion,
      unidad,
      setUnidad,
      anioMin: ANIO_MIN,
      anioMax: ANIO_MAX,
    }),
    [anio, region, unidad],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters debe usarse dentro de FilterProvider');
  return ctx;
};
