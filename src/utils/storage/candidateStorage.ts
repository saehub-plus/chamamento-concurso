
import { v4 as uuidv4 } from 'uuid';
import { Candidate, CandidateStatus } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

const STORAGE_KEY = 'candidates';
const CURRENT_USER_KEY = 'currentUser';

// Function to add a new candidate
export const addCandidate = (candidate: Omit<Candidate, 'id'>): Candidate => {
  const candidates = getCandidates();
  const newCandidate: Candidate = {
    id: uuidv4(),
    ...candidate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...candidates, newCandidate]));
  return newCandidate;
};

// Function to add multiple candidates at once
export const addMultipleCandidates = (names: string[], startPosition: number = 1): Candidate[] => {
  const candidates = getCandidates();
  
  const newCandidates = names.map((name, index) => {
    const position = startPosition + index;
    
    return {
      id: uuidv4(),
      name: name.trim(),
      position: position,
      status: 'classified' as CandidateStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
  
  const updatedCandidates = [...candidates, ...newCandidates];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCandidates));
  
  return newCandidates;
};

// Function to get all candidates
export const getCandidates = (): Candidate[] => {
  const candidatesJson = localStorage.getItem(STORAGE_KEY);
  const candidates = candidatesJson ? JSON.parse(candidatesJson) : [];
  
  // Add isCurrentUser property
  const currentUserId = getCurrentUserId();
  return candidates.map(candidate => ({
    ...candidate,
    isCurrentUser: candidate.id === currentUserId
  }));
};

// Function to update a candidate
export const updateCandidate = (id: string, candidate: Partial<Candidate>): Candidate | null => {
  const candidates = getCandidates();
  const candidateIndex = candidates.findIndex(c => c.id === id);
  if (candidateIndex === -1) return null;

  const updatedCandidate = {
    ...candidates[candidateIndex],
    ...candidate,
    updatedAt: new Date().toISOString()
  };
  candidates[candidateIndex] = updatedCandidate;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  return updatedCandidate;
};

// Function specifically for updating candidate status
export const updateCandidateStatus = (id: string, status: CandidateStatus): Candidate | null => {
  return updateCandidate(id, { status });
};

// Bulk update candidate status
export const bulkUpdateCandidateStatus = (ids: string[], status: CandidateStatus): number => {
  const candidates = getCandidates();
  let updatedCount = 0;
  
  const updatedCandidates = candidates.map(candidate => {
    if (ids.includes(candidate.id)) {
      updatedCount++;
      return {
        ...candidate,
        status,
        updatedAt: new Date().toISOString()
      };
    }
    return candidate;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCandidates));
  return updatedCount;
};

// Function to remove a candidate
export const removeCandidate = (id: string): boolean => {
  const candidates = getCandidates();
  const filteredCandidates = candidates.filter(c => c.id !== id);
  if (filteredCandidates.length === candidates.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCandidates));
  return true;
};

// Alias for removeCandidate for better naming
export const deleteCandidate = removeCandidate;

// Function to get candidate by ID
export const getCandidateById = (id: string): Candidate | undefined => {
  const candidates = getCandidates();
  const candidate = candidates.find(c => c.id === id);
  
  if (candidate) {
    return {
      ...candidate,
      isCurrentUser: candidate.id === getCurrentUserId()
    };
  }
  
  return undefined;
};

// Function to get candidate status counts
export const getCandidateStatusCounts = (): StatusCount => {
  const candidates = getCandidates();
  return {
    classified: candidates.filter(c => c.status === 'classified').length,
    called: candidates.filter(c => c.status === 'called').length,
    withdrawn: candidates.filter(c => c.status === 'withdrawn').length,
    eliminated: candidates.filter(c => c.status === 'eliminated').length,
    appointed: candidates.filter(c => c.status === 'appointed').length,
  };
};

export interface StatusCount {
  classified: number;
  called: number;
  withdrawn: number;
  eliminated: number;
  appointed: number;
}

// Calculate available positions: (Eliminated + Withdrawn) - Called
export const getAvailablePositions = (): number => {
  const candidates = getCandidates();
  
  const eliminated = candidates.filter(candidate => candidate.status === 'eliminated').length;
  const withdrawn = candidates.filter(candidate => candidate.status === 'withdrawn').length;
  const called = candidates.filter(candidate => candidate.status === 'called' || candidate.status === 'appointed').length;
  
  return (eliminated + withdrawn) - called;
};

// Mark candidate as current user
export const markAsCurrentUser = (id: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, id);
};

// Clear current user
export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Function to get current user ID
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

// Hook to use candidates
export const useCandidates = () => {
  const [candidates, setCandidates] = useLocalStorage<Candidate[]>(STORAGE_KEY, []);

  return {
    candidates,
    addCandidate: (candidate: Omit<Candidate, 'id'>) => {
      const newCandidate = addCandidate(candidate);
      setCandidates([...candidates, newCandidate]);
      return newCandidate;
    },
    updateCandidate: (id: string, candidate: Partial<Candidate>) => {
      const updatedCandidate = updateCandidate(id, candidate);
      if (updatedCandidate) {
        setCandidates(candidates.map(c => c.id === id ? updatedCandidate : c));
      }
      return updatedCandidate;
    },
    removeCandidate: (id: string) => {
      const isRemoved = removeCandidate(id);
      if (isRemoved) {
        setCandidates(candidates.filter(c => c.id !== id));
      }
      return isRemoved;
    }
  };
};
