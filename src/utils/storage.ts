// src/utils/storage.ts

import { useCompetition } from '@/context/CompetitionContext';
import { Candidate, Convocation, Document, DocumentsStatus, StatusCount } from '@/types';
import { useEffect, useState } from 'react';

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

// Candidate storage functions
export const getCandidates = (): Candidate[] => {
  const key = getStorageKey('candidates');
  const candidatesJson = localStorage.getItem(key);
  return candidatesJson ? JSON.parse(candidatesJson) : [];
};

export const addCandidate = (candidateData: Omit<Candidate, 'id'>): Candidate => {
  const candidates = getCandidates();
  const id = `candidate-${Date.now()}`;
  const newCandidate: Candidate = {
    ...candidateData,
    id,
    isCurrentUser: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  candidates.push(newCandidate);
  localStorage.setItem(getStorageKey('candidates'), JSON.stringify(candidates));
  return newCandidate;
};

export const updateCandidate = (id: string, data: Partial<Candidate>): void => {
  const candidates = getCandidates();
  const index = candidates.findIndex(c => c.id === id);
  
  if (index !== -1) {
    candidates[index] = {
      ...candidates[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(getStorageKey('candidates'), JSON.stringify(candidates));
  }
};

export const updateCandidateStatus = (id: string, status: Candidate['status']): void => {
  updateCandidate(id, { status });
};

export const removeCandidate = (id: string): void => {
  const candidates = getCandidates();
  const filtered = candidates.filter(c => c.id !== id);
  localStorage.setItem(getStorageKey('candidates'), JSON.stringify(filtered));
  
  // If the current user is removed, clear the currentUserId
  const currentUserId = getCurrentUserId();
  if (currentUserId === id) {
    localStorage.removeItem(getStorageKey('currentUserId'));
  }
};

export const getCandidateById = (id: string): Candidate | null => {
  const candidates = getCandidates();
  const candidate = candidates.find(c => c.id === id);
  return candidate || null;
};

export const getCurrentUserId = (): string | null => {
  const key = getStorageKey('currentUserId');
  return localStorage.getItem(key);
};

export const setCurrentUserId = (id: string | null): void => {
  const key = getStorageKey('currentUserId');
  if (id) {
    localStorage.setItem(key, id);
  } else {
    localStorage.removeItem(key);
  }
};

export const addMultipleCandidates = (startPosition: number, names: string[]): Candidate[] => {
  const candidates = getCandidates();
  const newCandidates: Candidate[] = [];
  
  names.forEach((name, index) => {
    const position = startPosition + index;
    const id = `candidate-${Date.now()}-${index}`;
    
    const newCandidate: Candidate = {
      id,
      name,
      position,
      status: 'classified',
      isCurrentUser: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    newCandidates.push(newCandidate);
  });
  
  const updatedCandidates = [...candidates, ...newCandidates];
  localStorage.setItem(getStorageKey('candidates'), JSON.stringify(updatedCandidates));
  
  return newCandidates;
};

export const getCandidateStatusCounts = (): StatusCount => {
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

// Convocation storage functions
export const getConvocations = (): Convocation[] => {
  const key = getStorageKey('convocations');
  const convocationsJson = localStorage.getItem(key);
  return convocationsJson ? JSON.parse(convocationsJson) : [];
};

export const addConvocation = (convocationData: Omit<Convocation, 'id' | 'createdAt' | 'updatedAt'>): Convocation => {
  const convocations = getConvocations();
  const id = `convocation-${Date.now()}`;
  
  const newConvocation: Convocation = {
    ...convocationData,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  convocations.push(newConvocation);
  localStorage.setItem(getStorageKey('convocations'), JSON.stringify(convocations));
  
  return newConvocation;
};

export const updateConvocation = (id: string, data: Partial<Convocation>): void => {
  const convocations = getConvocations();
  const index = convocations.findIndex(c => c.id === id);
  
  if (index !== -1) {
    convocations[index] = {
      ...convocations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(getStorageKey('convocations'), JSON.stringify(convocations));
  }
};

export const deleteConvocation = (id: string): void => {
  const convocations = getConvocations();
  const filtered = convocations.filter(c => c.id !== id);
  localStorage.setItem(getStorageKey('convocations'), JSON.stringify(filtered));
};

export const addMultipleEmptyConvocations = (dates: Date[]): Convocation[] => {
  const convocations = getConvocations();
  const newConvocations: Convocation[] = [];
  
  dates.forEach((date, index) => {
    const id = `convocation-${Date.now()}-${index}`;
    
    const newConvocation: Convocation = {
      id,
      date: date.toISOString(),
      hasCalled: false,
      calledCandidates: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    newConvocations.push(newConvocation);
  });
  
  const updatedConvocations = [...convocations, ...newConvocations];
  localStorage.setItem(getStorageKey('convocations'), JSON.stringify(updatedConvocations));
  
  return newConvocations;
};

// Document storage functions
export const getDocuments = (): Document[] => {
  const key = getStorageKey('documents');
  const documentsJson = localStorage.getItem(key);
  return documentsJson ? JSON.parse(documentsJson) : [];
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentsStatus>({
    total: 0,
    completed: 0,
    expired: 0,
    missing: 0,
    vaccineProblem: 0,
    percentage: 0
  });

  useEffect(() => {
    const loadDocuments = () => {
      const docs = getDocuments();
      setDocuments(docs);
      setDocumentStatus(getDocumentsStatus());
    };

    loadDocuments();
  }, []);

  const updateDocument = (id: string, data: Partial<Document>) => {
    const docs = getDocuments();
    const index = docs.findIndex(d => d.id === id);
    
    if (index !== -1) {
      docs[index] = {
        ...docs[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(getStorageKey('documents'), JSON.stringify(docs));
      setDocuments(docs);
      setDocumentStatus(getDocumentsStatus());
    }
  };

  return { documents, documentStatus, updateDocument };
};

export const isDocumentExpired = (document: Document): boolean => {
  if (!document.hasDocument || !document.expirationDate) return false;
  
  const today = new Date();
  const expirationDate = new Date(document.expirationDate);
  
  return expirationDate < today;
};

export const isDocumentComplete = (document: Document): boolean => {
  if (!document.hasDocument) return false;
  
  // Check if document has expiration and is not expired
  if (document.expirationDate && isDocumentExpired(document)) {
    return false;
  }
  
  // For vaccine documents, check if all doses are complete
  if (document.name.includes('Vacina') && document.vaccineDoses) {
    // Instead of checking vaccineDetails.isComplete, determine completion based on doses
    if (document.name === "Vacina Hepatite B") {
      return document.vaccineDoses.length >= 3;
    } else if (document.name === "Vacina DT") {
      return document.vaccineDoses.length >= 3;
    } else if (document.name === "Vacina Tríplice Viral") {
      if (!document.userAge) return false;
      return document.userAge >= 30 ? document.vaccineDoses.length >= 1 : document.vaccineDoses.length >= 2;
    }
  }
  
  return true;
};

export const hasVaccineProblem = (document: Document): boolean => {
  if (!document.hasDocument) return false;
  
  return document.name.includes('Vacina') && 
         document.vaccineDoses && 
         !isDocumentComplete(document);
};

export const getDocumentsStatus = (): DocumentsStatus => {
  const documents = getDocuments();
  
  const total = documents.length;
  const completed = documents.filter(doc => isDocumentComplete(doc)).length;
  const expired = documents.filter(doc => isDocumentExpired(doc)).length;
  const missing = documents.filter(doc => !doc.hasDocument).length;
  const vaccineProblem = documents.filter(doc => hasVaccineProblem(doc)).length;
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    expired,
    missing,
    vaccineProblem,
    percentage
  };
};

export const getDocumentsWithProblems = (): Document[] => {
  const documents = getDocuments();
  
  return documents.filter(doc => 
    !doc.hasDocument || 
    isDocumentExpired(doc) || 
    hasVaccineProblem(doc)
  );
};

export const getDocumentsExpiringBeforeDate = (date: Date, additionalDays: number = 0): Document[] => {
  const documents = getDocuments();
  const targetDate = new Date(date);
  
  if (additionalDays) {
    targetDate.setDate(targetDate.getDate() + additionalDays);
  }
  
  return documents.filter(doc => 
    doc.hasDocument && 
    doc.expirationDate && 
    new Date(doc.expirationDate) <= targetDate && 
    !isDocumentExpired(doc)
  );
};

// Prediction utility functions
export const predictCandidateCall = (position: number) => {
  const convocations = getConvocations();
  const candidates = getCandidates();
  
  // Filter to only include convocations with actual calls
  const convocationsWithCalls = convocations
    .filter(c => c.hasCalled && c.calledCandidates.length > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // If there are no convocations with calls, return a low confidence prediction
  if (convocationsWithCalls.length === 0) {
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      remainingCalls: position - 1,
      averageCallsPerDay: {
        overall: 0,
        last30Days: 0,
        last90Days: 0,
        dynamic: 0
      },
      confidence: 'low',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 }
      }
    };
  }
  
  // Calculate the highest position called so far
  const highestCalled = Math.max(
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => c.position)
  );
  
  // Calculate remaining calls needed
  const remainingCalls = Math.max(0, position - highestCalled);
  
  // If the candidate has already been called or surpassed
  if (remainingCalls <= 0) {
    return {
      predictedDate: new Date(),
      estimatedBusinessDays: 0,
      remainingCalls: 0,
      averageCallsPerDay: {
        overall: 0,
        last30Days: 0,
        last90Days: 0,
        dynamic: 0
      },
      confidence: 'high',
      scenarios: {
        pessimistic: { date: new Date(), businessDays: 0 },
        realistic: { date: new Date(), businessDays: 0 },
        optimistic: { date: new Date(), businessDays: 0 }
      }
    };
  }
  
  // Calculate different average call rates
  const now = new Date();
  const firstCallDate = new Date(convocationsWithCalls[0].date);
  const totalDays = Math.max(1, Math.ceil((now.getTime() - firstCallDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Count total candidates called
  const totalCalled = candidates.filter(c => 
    c.status === 'called' || c.status === 'appointed'
  ).length;
  
  // Calculate average calls per day (overall)
  const averageOverall = totalCalled / totalDays;
  
  // Last 30 days average
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const last30DaysConvocations = convocationsWithCalls.filter(
    c => new Date(c.date) >= thirtyDaysAgo
  );
  
  const last30DaysCalls = last30DaysConvocations.reduce(
    (sum, conv) => sum + conv.calledCandidates.length, 0
  );
  
  const averageLast30Days = last30DaysCalls / Math.min(30, totalDays);
  
  // Last 90 days average
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);
  
  const last90DaysConvocations = convocationsWithCalls.filter(
    c => new Date(c.date) >= ninetyDaysAgo
  );
  
  const last90DaysCalls = last90DaysConvocations.reduce(
    (sum, conv) => sum + conv.calledCandidates.length, 0
  );
  
  const averageLast90Days = last90DaysCalls / Math.min(90, totalDays);
  
  // Dynamic weighted average - gives more importance to recent data
  const dynamicAverage = 
    (averageOverall * 0.2) + 
    (averageLast90Days * 0.3) + 
    (averageLast30Days * 0.5);
  
  // Estimate business days - assuming 5 business days per 7 calendar days
  const callsPerBusinessDay = dynamicAverage * (7/5);
  const estimatedBusinessDays = callsPerBusinessDay > 0 ? 
    Math.ceil(remainingCalls / callsPerBusinessDay) : 
    1000; // Large number if no calls are happening
  
  // Calculate predicted date - add business days to current date
  // For simplicity, we'll just add the estimated business days * 1.4 to account for weekends
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + Math.ceil(estimatedBusinessDays * 1.4));
  
  // Create scenarios
  const pessimisticDays = Math.ceil(estimatedBusinessDays * 1.5);
  const optimisticDays = Math.max(1, Math.floor(estimatedBusinessDays * 0.7));
  
  const pessimisticDate = new Date();
  pessimisticDate.setDate(pessimisticDate.getDate() + Math.ceil(pessimisticDays * 1.4));
  
  const optimisticDate = new Date();
  optimisticDate.setDate(optimisticDate.getDate() + Math.ceil(optimisticDays * 1.4));
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  if (convocationsWithCalls.length >= 5 && totalCalled >= 10) {
    confidence = 'high';
  } else if (convocationsWithCalls.length < 3 || totalCalled < 5) {
    confidence = 'low';
  }
  
  return {
    predictedDate,
    estimatedBusinessDays,
    remainingCalls,
    averageCallsPerDay: {
      overall: parseFloat(averageOverall.toFixed(2)),
      last30Days: parseFloat(averageLast30Days.toFixed(2)),
      last90Days: parseFloat(averageLast90Days.toFixed(2)),
      dynamic: parseFloat(dynamicAverage.toFixed(2))
    },
    confidence,
    scenarios: {
      pessimistic: { 
        date: pessimisticDate, 
        businessDays: pessimisticDays 
      },
      realistic: { 
        date: predictedDate, 
        businessDays: estimatedBusinessDays 
      },
      optimistic: { 
        date: optimisticDate, 
        businessDays: optimisticDays 
      }
    }
  };
};

export const getCallProgress = (position: number): number => {
  const candidates = getCandidates();
  const highestPosition = Math.max(
    ...candidates.map(c => c.position)
  );
  
  const highestCalled = Math.max(
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => c.position),
    0
  );
  
  // If no one has been called yet
  if (highestCalled === 0) {
    return 0;
  }
  
  // If the candidate has already been called
  if (position <= highestCalled) {
    return 100;
  }
  
  // Calculate progress percentage
  const progress = (highestCalled / position) * 100;
  return Math.min(99, Math.round(progress)); // Cap at 99% until actually called
};
