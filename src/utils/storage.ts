
import { Candidate, Convocation } from '@/types';

// Storage keys
const CANDIDATES_KEY = 'joinville-nurses-candidates';
const CONVOCATIONS_KEY = 'joinville-nurses-convocations';
const CURRENT_USER_KEY = 'joinville-nurses-current-user';

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

// Calculate call prediction based on historical data
export const predictCandidateCall = (candidatePosition: number): { 
  predictedDate: Date | null;
  callsPerMonth: number;
  remainingCalls: number;
  confidence: 'high' | 'medium' | 'low';
} => {
  const convocations = getConvocations();
  const candidates = getCandidates();
  
  // No convocations yet
  if (convocations.length === 0) {
    return { 
      predictedDate: null, 
      callsPerMonth: 0, 
      remainingCalls: 0,
      confidence: 'low'
    };
  }
  
  // Get called and classified candidates
  const calledCount = candidates.filter(c => c.status === 'called' || c.status === 'appointed').length;
  const classifiedBeforePosition = candidates.filter(c => c.status === 'classified' && c.position < candidatePosition).length;
  
  // Get date range of convocations
  const dates = convocations
    .filter(c => c.hasCalled)
    .map(c => new Date(c.date).getTime());
  
  if (dates.length < 2) {
    return { 
      predictedDate: null, 
      callsPerMonth: 0, 
      remainingCalls: classifiedBeforePosition,
      confidence: 'low'
    };
  }
  
  const oldestDate = Math.min(...dates);
  const newestDate = Math.max(...dates);
  const monthsDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24 * 30);
  
  // Calculate calls per month
  const callsPerMonth = monthsDiff > 0 ? calledCount / monthsDiff : 0;
  
  // Predict date
  const remainingCalls = classifiedBeforePosition;
  const monthsUntilCall = callsPerMonth > 0 ? remainingCalls / callsPerMonth : 0;
  
  let predictedDate = null;
  if (monthsUntilCall > 0) {
    predictedDate = new Date();
    predictedDate.setMonth(predictedDate.getMonth() + monthsUntilCall);
  }
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (convocations.length > 5 && monthsDiff > 3) {
    confidence = 'high';
  } else if (convocations.length > 2) {
    confidence = 'medium';
  }
  
  return {
    predictedDate,
    callsPerMonth: parseFloat(callsPerMonth.toFixed(1)),
    remainingCalls,
    confidence
  };
};

// Get progress to being called (percentage)
export const getCallProgress = (candidatePosition: number): number => {
  const candidates = getCandidates();
  
  if (candidates.length === 0) return 0;
  
  // Find highest called position
  const highestCalledPosition = Math.max(
    0,
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => c.position)
  );
  
  if (highestCalledPosition === 0) return 0;
  
  // Calculate progress
  const progress = (highestCalledPosition / candidatePosition) * 100;
  return Math.min(99, progress); // Cap at 99% until actually called
};
