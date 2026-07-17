import { useState, useCallback } from 'react';

const KEY = 'dnb-name';

export function useLocalName() {
  const [name, setNameState] = useState(() => localStorage.getItem(KEY) || '');

  const setName = useCallback((value) => {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(KEY, trimmed);
    } else {
      localStorage.removeItem(KEY);
    }
    setNameState(trimmed);
  }, []);

  return { name, setName };
}