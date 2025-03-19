
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Candidate, CandidateStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";

const COLLECTION_NAME = "candidates";

// Add a new candidate
export const addCandidate = async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
  const newCandidate: Candidate = {
    id: uuidv4(),
    ...candidate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await setDoc(doc(db, COLLECTION_NAME, newCandidate.id), newCandidate);
  return newCandidate;
};

// Add multiple candidates
export const addMultipleCandidates = async (
  names: string[], 
  startPosition: number = 1
): Promise<Candidate[]> => {
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
  
  // Create batch operations for efficiency
  const batch = [];
  for (const candidate of newCandidates) {
    batch.push(setDoc(doc(db, COLLECTION_NAME, candidate.id), candidate));
  }
  
  await Promise.all(batch);
  return newCandidates;
};

// Get all candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  
  // Add isCurrentUser property
  const currentUserId = await getCurrentUserId();
  return querySnapshot.docs.map(doc => ({
    ...doc.data() as Candidate,
    isCurrentUser: doc.id === currentUserId
  }));
};

// Update a candidate
export const updateCandidate = async (
  id: string, 
  candidateUpdate: Partial<Candidate>
): Promise<Candidate | null> => {
  const candidateRef = doc(db, COLLECTION_NAME, id);
  const candidateDoc = await getDoc(candidateRef);
  
  if (!candidateDoc.exists()) return null;
  
  const currentCandidate = candidateDoc.data() as Candidate;
  const updatedCandidate = {
    ...currentCandidate,
    ...candidateUpdate,
    updatedAt: new Date().toISOString()
  };
  
  await updateDoc(candidateRef, updatedCandidate);
  return updatedCandidate;
};

// Update candidate status
export const updateCandidateStatus = async (
  id: string, 
  status: CandidateStatus
): Promise<Candidate | null> => {
  return updateCandidate(id, { status });
};

// Bulk update candidate status
export const bulkUpdateCandidateStatus = async (
  ids: string[], 
  status: CandidateStatus
): Promise<number> => {
  let updatedCount = 0;
  
  // Create batch operations for efficiency
  const batch = [];
  for (const id of ids) {
    const candidateRef = doc(db, COLLECTION_NAME, id);
    const candidateDoc = await getDoc(candidateRef);
    
    if (candidateDoc.exists()) {
      const candidate = candidateDoc.data() as Candidate;
      const updatedCandidate = {
        ...candidate,
        status,
        updatedAt: new Date().toISOString()
      };
      
      batch.push(updateDoc(candidateRef, updatedCandidate));
      updatedCount++;
    }
  }
  
  await Promise.all(batch);
  return updatedCount;
};

// Delete a candidate
export const deleteCandidate = async (id: string): Promise<boolean> => {
  const candidateRef = doc(db, COLLECTION_NAME, id);
  const candidateDoc = await getDoc(candidateRef);
  
  if (!candidateDoc.exists()) return false;
  
  await deleteDoc(candidateRef);
  return true;
};

// Alias for deleteCandidate
export const removeCandidate = deleteCandidate;

// Get candidate by ID
export const getCandidateById = async (id: string): Promise<Candidate | undefined> => {
  const candidateRef = doc(db, COLLECTION_NAME, id);
  const candidateDoc = await getDoc(candidateRef);
  
  if (!candidateDoc.exists()) return undefined;
  
  const candidate = candidateDoc.data() as Candidate;
  const currentUserId = await getCurrentUserId();
  
  return {
    ...candidate,
    isCurrentUser: candidate.id === currentUserId
  };
};

// Get candidate status counts
export interface StatusCount {
  classified: number;
  called: number;
  withdrawn: number;
  eliminated: number;
  appointed: number;
}

export const getCandidateStatusCounts = async (): Promise<StatusCount> => {
  const candidates = await getCandidates();
  
  return {
    classified: candidates.filter(c => c.status === 'classified').length,
    called: candidates.filter(c => c.status === 'called').length,
    withdrawn: candidates.filter(c => c.status === 'withdrawn').length,
    eliminated: candidates.filter(c => c.status === 'eliminated').length,
    appointed: candidates.filter(c => c.status === 'appointed').length,
  };
};

// Calculate available positions: (Eliminated + Withdrawn) - Called
export const getAvailablePositions = async (): Promise<number> => {
  const candidates = await getCandidates();
  
  const eliminated = candidates.filter(candidate => candidate.status === 'eliminated').length;
  const withdrawn = candidates.filter(candidate => candidate.status === 'withdrawn').length;
  const called = candidates.filter(candidate => 
    candidate.status === 'called' || candidate.status === 'appointed'
  ).length;
  
  return (eliminated + withdrawn) - called;
};

// Current user management
const CURRENT_USER_KEY = 'currentUser';

// Mark candidate as current user
export const markAsCurrentUser = (id: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, id);
};

// Clear current user
export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  return localStorage.getItem(CURRENT_USER_KEY);
};
