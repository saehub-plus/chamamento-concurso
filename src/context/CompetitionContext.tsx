
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type CompetitionType = 'joinville' | 'florianopolis-concurso' | 'florianopolis-processo';

interface CompetitionContextType {
  currentCompetition: CompetitionType;
  setCurrentCompetition: (competition: CompetitionType) => void;
  getCompetitionTitle: () => string;
  getCompetitionLogo: () => string;
  getStoragePrefix: () => string;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export const CompetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCompetition, setCurrentCompetition] = useState<CompetitionType>('joinville');
  const location = useLocation();

  useEffect(() => {
    // Extract the competition from the URL path
    const path = location.pathname;
    if (path.startsWith('/joinville')) {
      setCurrentCompetition('joinville');
    } else if (path.startsWith('/florianopolis-concurso')) {
      setCurrentCompetition('florianopolis-concurso');
    } else if (path.startsWith('/florianopolis-processo')) {
      setCurrentCompetition('florianopolis-processo');
    }
  }, [location]);

  const getCompetitionTitle = (): string => {
    switch (currentCompetition) {
      case 'joinville':
        return 'Concurso Público EDITAL Nº 001/2024/SGP.UDS - Joinville';
      case 'florianopolis-concurso':
        return 'Concurso Público EDITAL Nº 001/2024 - Florianópolis';
      case 'florianopolis-processo':
        return 'Processo Seletivo Simplificado nº 004/2025 - Florianópolis';
      default:
        return 'Concursos';
    }
  };

  const getCompetitionLogo = (): string => {
    switch (currentCompetition) {
      case 'joinville':
        return '/lovable-uploads/2ffdbb6f-3cb5-4fa5-9565-5d87797f474f.png';
      case 'florianopolis-concurso':
      case 'florianopolis-processo':
        return '/lovable-uploads/cedd88cf-ba98-4c11-8c7f-caae4b6289e9.png';
      default:
        return '/lovable-uploads/2ffdbb6f-3cb5-4fa5-9565-5d87797f474f.png';
    }
  };

  const getStoragePrefix = (): string => {
    return currentCompetition;
  };

  return (
    <CompetitionContext.Provider 
      value={{ 
        currentCompetition, 
        setCurrentCompetition, 
        getCompetitionTitle, 
        getCompetitionLogo,
        getStoragePrefix
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = (): CompetitionContextType => {
  const context = useContext(CompetitionContext);
  if (context === undefined) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
};
