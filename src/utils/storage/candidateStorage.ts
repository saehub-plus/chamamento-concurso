import { v4 as uuidv4 } from 'uuid';
import { Candidate, CandidateStatus } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

const STORAGE_KEY = 'candidates';

// Function to add a new candidate
export const addCandidate = (candidate: Omit<Candidate, 'id'>): Candidate => {
  const candidates = getCandidates();
  const newCandidate: Candidate = {
    id: uuidv4(),
    ...candidate,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...candidates, newCandidate]));
  return newCandidate;
};

// Function to get all candidates
export const getCandidates = (): Candidate[] => {
  const candidatesJson = localStorage.getItem(STORAGE_KEY);
  return candidatesJson ? JSON.parse(candidatesJson) : [];
};

// Function to update a candidate
export const updateCandidate = (id: string, candidate: Partial<Candidate>): Candidate | null => {
  const candidates = getCandidates();
  const candidateIndex = candidates.findIndex(c => c.id === id);
  if (candidateIndex === -1) return null;

  const updatedCandidate = {
    ...candidates[candidateIndex],
    ...candidate,
  };
  candidates[candidateIndex] = updatedCandidate;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  return updatedCandidate;
};

// Function to remove a candidate
export const removeCandidate = (id: string): boolean => {
  const candidates = getCandidates();
  const filteredCandidates = candidates.filter(c => c.id !== id);
  if (filteredCandidates.length === candidates.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCandidates));
  return true;
};

// Function to get candidate by ID
export const getCandidateById = (id: string): Candidate | undefined => {
  const candidates = getCandidates();
  return candidates.find(c => c.id === id);
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

// Function to get current user ID (for testing purposes)
export const getCurrentUserId = (): string | null => {
  // This is a placeholder, replace with actual authentication logic
  // For now, return the ID of the first candidate in the list
  const candidates = getCandidates();
  return candidates.length > 0 ? candidates[0].id : null;
};
