
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { Candidate, Convocation, Document, DocumentsStatus } from '@/types';
import { 
  getCandidates as fetchCandidates,
  addCandidate as createCandidate,
  updateCandidate as updateCandidateData,
  deleteCandidate as deleteCandidateData,
  getAvailablePositions as getAvailablePositionsData
} from '@/services/firestore/candidates';
import {
  getConvocations as fetchConvocations,
  addConvocation as createConvocation,
  updateConvocation as updateConvocationData,
  deleteConvocation as deleteConvocationData,
  getConvocationsWithCandidates as fetchConvocationsWithCandidates
} from '@/services/firestore/convocations';
import {
  getDocuments as fetchDocuments,
  getDocumentsStatus as fetchDocumentsStatus,
  addDocument as createDocument,
  updateDocument as updateDocumentData,
  removeDocument as removeDocumentData,
  getDocumentsWithProblems as fetchDocumentsWithProblems,
  getDocumentsExpiringBeforeDate as fetchDocumentsExpiringBeforeDate
} from '@/services/firestore/documents';

// Define the Firebase context shape
interface FirebaseContextType {
  // Candidates
  candidates: Candidate[];
  loading: boolean;
  addCandidate: (candidate: Omit<Candidate, 'id'>) => Promise<Candidate>;
  updateCandidate: (id: string, candidate: Partial<Candidate>) => Promise<Candidate | null>;
  removeCandidate: (id: string) => Promise<boolean>;
  getAvailablePositions: () => Promise<number>;
  
  // Convocations
  convocations: Convocation[];
  convocationsWithCandidates: Convocation[];
  addConvocation: (convocation: Omit<Convocation, 'id' | 'createdAt'>) => Promise<Convocation>;
  updateConvocation: (id: string, updates: Partial<Convocation>) => Promise<Convocation | null>;
  deleteConvocation: (id: string) => Promise<boolean>;
  
  // Documents
  documents: Document[];
  documentStatus: DocumentsStatus;
  documentsWithProblems: Document[];
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Document>;
  updateDocument: (id: string, document: Partial<Document>) => Promise<Document | null>;
  removeDocument: (id: string) => Promise<boolean>;
  getDocumentsExpiringBeforeDate: (targetDate: Date, includeDays?: number) => Promise<Document[]>;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

// Create the context with a default empty object
const FirebaseContext = createContext<FirebaseContextType>({} as FirebaseContextType);

// Provider component that wraps the app
export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [convocationsWithCandidates, setConvocationsWithCandidates] = useState<Convocation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentsStatus>({
    total: 0,
    completed: 0,
    expired: 0,
    missing: 0,
    vaccineProblem: 0,
    percentage: 0
  });
  const [documentsWithProblems, setDocumentsWithProblems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data from Firestore
  const loadData = async () => {
    setLoading(true);
    try {
      // Load candidates
      const candidatesData = await fetchCandidates();
      setCandidates(candidatesData);
      
      // Load convocations
      const convocationsData = await fetchConvocations();
      setConvocations(convocationsData);
      
      // Load convocations with candidates
      const convocationsWithCandidatesData = await fetchConvocationsWithCandidates();
      setConvocationsWithCandidates(convocationsWithCandidatesData);
      
      // Load documents
      const documentsData = await fetchDocuments();
      setDocuments(documentsData);
      
      // Load document status
      const documentStatusData = await fetchDocumentsStatus();
      setDocumentStatus(documentStatusData);
      
      // Load documents with problems
      const documentsWithProblemsData = await fetchDocumentsWithProblems();
      setDocumentsWithProblems(documentsWithProblemsData);
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Add a candidate
  const addCandidate = async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    const newCandidate = await createCandidate(candidate);
    setCandidates([...candidates, newCandidate]);
    return newCandidate;
  };

  // Update a candidate
  const updateCandidate = async (id: string, candidateUpdate: Partial<Candidate>): Promise<Candidate | null> => {
    const updatedCandidate = await updateCandidateData(id, candidateUpdate);
    if (updatedCandidate) {
      setCandidates(candidates.map(c => c.id === id ? updatedCandidate : c));
    }
    return updatedCandidate;
  };

  // Remove a candidate
  const removeCandidate = async (id: string): Promise<boolean> => {
    const isRemoved = await deleteCandidateData(id);
    if (isRemoved) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
    return isRemoved;
  };

  // Get available positions
  const getAvailablePositions = async (): Promise<number> => {
    return getAvailablePositionsData();
  };

  // Add a convocation
  const addConvocation = async (convocation: Omit<Convocation, 'id' | 'createdAt'>): Promise<Convocation> => {
    const newConvocation = await createConvocation(convocation);
    setConvocations([...convocations, newConvocation]);
    
    if (newConvocation.hasCalled && newConvocation.calledCandidates && newConvocation.calledCandidates.length > 0) {
      setConvocationsWithCandidates([...convocationsWithCandidates, newConvocation]);
    }
    
    return newConvocation;
  };

  // Update a convocation
  const updateConvocation = async (id: string, updates: Partial<Convocation>): Promise<Convocation | null> => {
    const updatedConvocation = await updateConvocationData(id, updates);
    if (updatedConvocation) {
      setConvocations(convocations.map(c => c.id === id ? updatedConvocation : c));
      
      // Update convocations with candidates if needed
      if (updatedConvocation.hasCalled && updatedConvocation.calledCandidates && updatedConvocation.calledCandidates.length > 0) {
        if (!convocationsWithCandidates.some(c => c.id === id)) {
          setConvocationsWithCandidates([...convocationsWithCandidates, updatedConvocation]);
        } else {
          setConvocationsWithCandidates(convocationsWithCandidates.map(c => c.id === id ? updatedConvocation : c));
        }
      } else {
        setConvocationsWithCandidates(convocationsWithCandidates.filter(c => c.id !== id));
      }
    }
    return updatedConvocation;
  };

  // Delete a convocation
  const deleteConvocation = async (id: string): Promise<boolean> => {
    const isDeleted = await deleteConvocationData(id);
    if (isDeleted) {
      setConvocations(convocations.filter(c => c.id !== id));
      setConvocationsWithCandidates(convocationsWithCandidates.filter(c => c.id !== id));
    }
    return isDeleted;
  };

  // Add a document
  const addDocument = async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
    const newDocument = await createDocument(document);
    setDocuments([...documents, newDocument]);
    
    // Refresh document status and documents with problems
    const updatedStatus = await fetchDocumentsStatus();
    setDocumentStatus(updatedStatus);
    
    const updatedProblems = await fetchDocumentsWithProblems();
    setDocumentsWithProblems(updatedProblems);
    
    return newDocument;
  };

  // Update a document
  const updateDocument = async (id: string, documentUpdate: Partial<Document>): Promise<Document | null> => {
    const updatedDocument = await updateDocumentData(id, documentUpdate);
    if (updatedDocument) {
      setDocuments(documents.map(d => d.id === id ? updatedDocument : d));
      
      // Refresh document status and documents with problems
      const updatedStatus = await fetchDocumentsStatus();
      setDocumentStatus(updatedStatus);
      
      const updatedProblems = await fetchDocumentsWithProblems();
      setDocumentsWithProblems(updatedProblems);
    }
    return updatedDocument;
  };

  // Remove a document
  const removeDocument = async (id: string): Promise<boolean> => {
    const isRemoved = await removeDocumentData(id);
    if (isRemoved) {
      setDocuments(documents.filter(d => d.id !== id));
      
      // Refresh document status and documents with problems
      const updatedStatus = await fetchDocumentsStatus();
      setDocumentStatus(updatedStatus);
      
      const updatedProblems = await fetchDocumentsWithProblems();
      setDocumentsWithProblems(updatedProblems);
    }
    return isRemoved;
  };

  // Get documents expiring before a date
  const getDocumentsExpiringBeforeDate = async (targetDate: Date, includeDays: number = 15): Promise<Document[]> => {
    return fetchDocumentsExpiringBeforeDate(targetDate, includeDays);
  };

  // Refresh all data
  const refreshData = async (): Promise<void> => {
    await loadData();
  };

  return (
    <FirebaseContext.Provider value={{
      candidates,
      loading,
      addCandidate,
      updateCandidate,
      removeCandidate,
      getAvailablePositions,
      convocations,
      convocationsWithCandidates,
      addConvocation,
      updateConvocation,
      deleteConvocation,
      documents,
      documentStatus,
      documentsWithProblems,
      addDocument,
      updateDocument,
      removeDocument,
      getDocumentsExpiringBeforeDate,
      refreshData,
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use the Firebase context
export const useFirebase = () => useContext(FirebaseContext);
