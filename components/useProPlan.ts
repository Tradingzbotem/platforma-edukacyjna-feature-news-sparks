// components/useProPlan.ts
'use client';
import { useEffect, useState } from 'react';

const KEY = 'plan:pro';

export function useProPlan() {
  const [pro, setPro] = useState(false);

  useEffect(() => {
    try { setPro(localStorage.getItem(KEY) === '1'); } catch {}
  }, []);

  const enable = () => { try { localStorage.setItem(KEY, '1'); setPro(true); } catch {} };
  const disable = () => { try { localStorage.removeItem(KEY); setPro(false); } catch {} };

  return { pro, enable, disable };
}
