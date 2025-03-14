
import { Candidate, Convocation } from '@/types';

// Storage keys
const CANDIDATES_KEY = 'joinville-nurses-candidates';
const CONVOCATIONS_KEY = 'joinville-nurses-convocations';

// Retrieve data from localStorage
export const getCandidates = (): Candidate[] => {
  const data = localStorage.getItem(CANDIDATES_KEY);
  return data ? JSON.parse(data) : [];
};

export const getConvocations = (): Convocation[] => {
  const data = localStorage.getItem(CONVOCATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// Save data to localStorage
export const saveCandidates = (candidates: Candidate[]): void => {
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
};

export const saveConvocations = (convocations: Convocation[]): void => {
  localStorage.setItem(CONVOCATIONS_KEY, JSON.stringify(convocations));
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

// Add new convocation
export const addConvocation = (convocation: Omit<Convocation, 'id' | 'createdAt'>): Convocation => {
  const convocations = getConvocations();
  const newConvocation: Convocation = {
    ...convocation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  
  saveConvocations([...convocations, newConvocation]);
  return newConvocation;
};

// Update convocation
export const updateConvocation = (id: string, updates: Partial<Convocation>): Convocation | null => {
  const convocations = getConvocations();
  const convocationIndex = convocations.findIndex(c => c.id === id);
  
  if (convocationIndex === -1) return null;
  
  const updatedConvocation = {
    ...convocations[convocationIndex],
    ...updates
  };
  
  convocations[convocationIndex] = updatedConvocation;
  saveConvocations(convocations);
  
  return updatedConvocation;
};

// Delete convocation
export const deleteConvocation = (id: string): boolean => {
  const convocations = getConvocations();
  const filteredConvocations = convocations.filter(c => c.id !== id);
  
  if (filteredConvocations.length === convocations.length) return false;
  
  saveConvocations(filteredConvocations);
  return true;
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

// Get latest convocations
export const getLatestConvocations = (limit = 5): Convocation[] => {
  const convocations = getConvocations();
  return [...convocations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// Get candidate by ID
export const getCandidateById = (id: string): Candidate | undefined => {
  const candidates = getCandidates();
  return candidates.find(c => c.id === id);
};

// Update candidate status
export const updateCandidateStatus = (id: string, status: Candidate['status']): Candidate | null => {
  return updateCandidate(id, { status });
};
