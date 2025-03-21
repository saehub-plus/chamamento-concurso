
import { Convocation } from '@/types';
import { toast } from '@/hooks/use-toast';

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
export const addConvocation = (convocation: Omit<Convocation, 'id' | 'createdAt' | 'updatedAt'>): Convocation => {
  const convocations = getConvocations();
  const now = new Date().toISOString();
  const newConvocation: Convocation = {
    ...convocation,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  };
  
  saveConvocations([...convocations, newConvocation]);
  
  // Show toast notification
  if (newConvocation.hasCalled && newConvocation.calledCandidates && newConvocation.calledCandidates.length > 0) {
    toast({
      title: "Convocação registrada",
      description: `${newConvocation.calledCandidates.length} candidato(s) foram convocados.`
    });
  } else {
    toast({
      title: "Data de convocação registrada",
      description: `Data de ${new Date(newConvocation.date).toLocaleDateString('pt-BR')} foi registrada.`
    });
  }
  
  return newConvocation;
};

// Add multiple convocations with no calls
export const addMultipleEmptyConvocations = (dates: Date[]): Convocation[] => {
  const convocations = getConvocations();
  const now = new Date().toISOString();
  
  const newConvocations: Convocation[] = dates.map(date => ({
    id: crypto.randomUUID(),
    date: date.toISOString(),
    hasCalled: false,
    calledCandidates: [],
    createdAt: now,
    updatedAt: now
  }));
  
  saveConvocations([...convocations, ...newConvocations]);
  
  // Show toast notification
  toast({
    title: "Datas de convocação registradas",
    description: `${dates.length} novas datas foram adicionadas.`
  });
  
  return newConvocations;
};

// Update convocation
export const updateConvocation = (id: string, updates: Partial<Convocation>): Convocation | null => {
  const convocations = getConvocations();
  const convocationIndex = convocations.findIndex(c => c.id === id);
  
  if (convocationIndex === -1) return null;
  
  const oldConvocation = convocations[convocationIndex];
  const updatedConvocation = {
    ...oldConvocation,
    ...updates,
    updatedAt: new Date().toISOString() // Always update the updatedAt field
  };
  
  convocations[convocationIndex] = updatedConvocation;
  saveConvocations(convocations);
  
  // Show toast notification for significant changes
  if (updates.hasCalled && !oldConvocation.hasCalled) {
    toast({
      title: "Convocação atualizada",
      description: "Candidatos foram adicionados à convocação."
    });
  }
  
  return updatedConvocation;
};

// Delete convocation
export const deleteConvocation = (id: string): boolean => {
  const convocations = getConvocations();
  const filteredConvocations = convocations.filter(c => c.id !== id);
  
  if (filteredConvocations.length === convocations.length) return false;
  
  saveConvocations(filteredConvocations);
  
  // Show toast notification
  toast({
    title: "Convocação removida",
    description: "A convocação foi removida com sucesso."
  });
  
  return true;
};

// Get latest convocations
export const getLatestConvocations = (limit = 5): Convocation[] => {
  const convocations = getConvocations();
  return [...convocations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// Get convocations with candidates (for dashboard count)
export const getConvocationsWithCandidates = (): Convocation[] => {
  const convocations = getConvocations();
  return convocations.filter(c => c.hasCalled && c.calledCandidates && c.calledCandidates.length > 0);
};
