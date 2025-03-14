
import { Convocation } from '@/types';

// Storage keys
const CONVOCATIONS_KEY = 'joinville-nurses-convocations';

// Retrieve convocations from localStorage
export const getConvocations = (): Convocation[] => {
  const data = localStorage.getItem(CONVOCATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// Save convocations to localStorage
export const saveConvocations = (convocations: Convocation[]): void => {
  localStorage.setItem(CONVOCATIONS_KEY, JSON.stringify(convocations));
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

// Add multiple convocations with no calls
export const addMultipleEmptyConvocations = (dates: Date[]): Convocation[] => {
  const convocations = getConvocations();
  
  const newConvocations: Convocation[] = dates.map(date => ({
    id: crypto.randomUUID(),
    date: date.toISOString(),
    hasCalled: false,
    calledCandidates: [],
    createdAt: new Date().toISOString()
  }));
  
  saveConvocations([...convocations, ...newConvocations]);
  return newConvocations;
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

// Get latest convocations
export const getLatestConvocations = (limit = 5): Convocation[] => {
  const convocations = getConvocations();
  return [...convocations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};
