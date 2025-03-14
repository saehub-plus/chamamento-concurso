
import { Candidate } from '@/types';

// Storage keys
const CANDIDATES_KEY = 'joinville-nurses-candidates';
const CURRENT_USER_KEY = 'joinville-nurses-current-user';

// Retrieve candidates from localStorage
export const getCandidates = (): Candidate[] => {
  const data = localStorage.getItem(CANDIDATES_KEY);
  return data ? JSON.parse(data) : [];
};

// Save candidates to localStorage
export const saveCandidates = (candidates: Candidate[]): void => {
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
};

// Add new candidate
export const addCandidate = (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Candidate => {
  const candidates = getCandidates();
  const newCandidate: Candidate = {
    ...candidate,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveCandidates([...candidates, newCandidate]);
  return newCandidate;
};

// Add multiple candidates at once
export const addMultipleCandidates = (names: string[]): Candidate[] => {
  const candidates = getCandidates();
  const startPosition = candidates.length > 0 
    ? Math.max(...candidates.map(c => c.position)) + 1 
    : 1;
  
  const newCandidates: Candidate[] = names.map((name, index) => ({
    id: crypto.randomUUID(),
    name: name.trim(),
    position: startPosition + index,
    status: 'classified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  saveCandidates([...candidates, ...newCandidates]);
  return newCandidates;
};

// Update candidate
export const updateCandidate = (id: string, updates: Partial<Candidate>): Candidate | null => {
  const candidates = getCandidates();
  const candidateIndex = candidates.findIndex(c => c.id === id);
  
  if (candidateIndex === -1) return null;
  
  const updatedCandidate = {
    ...candidates[candidateIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  candidates[candidateIndex] = updatedCandidate;
  saveCandidates(candidates);
  
  return updatedCandidate;
};

// Delete candidate
export const deleteCandidate = (id: string): boolean => {
  const candidates = getCandidates();
  const filteredCandidates = candidates.filter(c => c.id !== id);
  
  if (filteredCandidates.length === candidates.length) return false;
  
  saveCandidates(filteredCandidates);
  return true;
};

// Update candidate status
export const updateCandidateStatus = (id: string, status: Candidate['status']): Candidate | null => {
  return updateCandidate(id, { status });
};

// Bulk update candidate status
export const bulkUpdateCandidateStatus = (ids: string[], status: Candidate['status']): number => {
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
  
  saveCandidates(updatedCandidates);
  return updatedCount;
};

// Get candidate by ID
export const getCandidateById = (id: string): Candidate | undefined => {
  const candidates = getCandidates();
  return candidates.find(c => c.id === id);
};

// Get candidate by name (case insensitive partial match)
export const getCandidateByName = (name: string): Candidate | undefined => {
  const candidates = getCandidates();
  const lowerName = name.toLowerCase();
  return candidates.find(c => c.name.toLowerCase().includes(lowerName));
};

// Get current user ID from localStorage
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

// Set current user ID in localStorage
export const setCurrentUserId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Mark candidate as current user
export const markAsCurrentUser = (id: string): void => {
  const candidates = getCandidates();
  
  // Reset all candidates
  const updatedCandidates = candidates.map(c => ({
    ...c,
    isCurrentUser: c.id === id
  }));
  
  saveCandidates(updatedCandidates);
  setCurrentUserId(id);
};

// Clear current user
export const clearCurrentUser = (): void => {
  const candidates = getCandidates();
  
  // Reset all candidates
  const updatedCandidates = candidates.map(c => ({
    ...c,
    isCurrentUser: false
  }));
  
  saveCandidates(updatedCandidates);
  setCurrentUserId(null);
};

// Get candidate status counts
export const getCandidateStatusCounts = () => {
  const candidates = getCandidates();
  
  return candidates.reduce((counts, candidate) => {
    counts[candidate.status]++;
    return counts;
  }, {
    classified: 0,
    called: 0,
    withdrawn: 0,
    eliminated: 0,
    appointed: 0
  });
};
