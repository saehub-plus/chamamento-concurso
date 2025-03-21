// src/utils/storage.ts

import { useCompetition } from '@/context/CompetitionContext';

// Wrapper para adicionar o prefixo do concurso selecionado às chaves de storage
export const getStorageKey = (key: string): string => {
  // For non-React contexts, try to extract competition from URL
  let competition = 'joinville'; // default
  
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/florianopolis-concurso')) {
      competition = 'florianopolis-concurso';
    } else if (path.startsWith('/florianopolis-processo')) {
      competition = 'florianopolis-processo';
    } else if (path.startsWith('/joinville')) {
      competition = 'joinville';
    }
  }
  
  return `${competition}-${key}`;
};
