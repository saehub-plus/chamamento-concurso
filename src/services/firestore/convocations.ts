
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
  orderBy,
  setDoc
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Convocation } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

const COLLECTION_NAME = "convocations";

// Retrieve convocations from Firestore
export const getConvocations = async (): Promise<Convocation[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => doc.data() as Convocation);
};

// Save convocations to Firestore
export const saveConvocations = async (convocations: Convocation[]): Promise<void> => {
  // Create batch operations
  const batch = [];
  for (const convocation of convocations) {
    batch.push(setDoc(doc(db, COLLECTION_NAME, convocation.id), convocation));
  }
  
  await Promise.all(batch);
};

// Add new convocation
export const addConvocation = async (
  convocation: Omit<Convocation, 'id' | 'createdAt'>
): Promise<Convocation> => {
  const newConvocation: Convocation = {
    ...convocation,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  
  await setDoc(doc(db, COLLECTION_NAME, newConvocation.id), newConvocation);
  
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
export const addMultipleEmptyConvocations = async (dates: Date[]): Promise<Convocation[]> => {
  const newConvocations: Convocation[] = dates.map(date => ({
    id: uuidv4(),
    date: date.toISOString(),
    hasCalled: false,
    calledCandidates: [],
    createdAt: new Date().toISOString()
  }));
  
  // Create batch operations
  const batch = [];
  for (const convocation of newConvocations) {
    batch.push(setDoc(doc(db, COLLECTION_NAME, convocation.id), convocation));
  }
  
  await Promise.all(batch);
  
  // Show toast notification
  toast({
    title: "Datas de convocação registradas",
    description: `${dates.length} novas datas foram adicionadas.`
  });
  
  return newConvocations;
};

// Update convocation
export const updateConvocation = async (
  id: string, 
  updates: Partial<Convocation>
): Promise<Convocation | null> => {
  const convocationRef = doc(db, COLLECTION_NAME, id);
  const convocationDoc = await getDoc(convocationRef);
  
  if (!convocationDoc.exists()) return null;
  
  const oldConvocation = convocationDoc.data() as Convocation;
  const updatedConvocation = {
    ...oldConvocation,
    ...updates
  };
  
  await updateDoc(convocationRef, updatedConvocation);
  
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
export const deleteConvocation = async (id: string): Promise<boolean> => {
  const convocationRef = doc(db, COLLECTION_NAME, id);
  const convocationDoc = await getDoc(convocationRef);
  
  if (!convocationDoc.exists()) return false;
  
  await deleteDoc(convocationRef);
  
  // Show toast notification
  toast({
    title: "Convocação removida",
    description: "A convocação foi removida com sucesso."
  });
  
  return true;
};

// Get latest convocations
export const getLatestConvocations = async (limit = 5): Promise<Convocation[]> => {
  const convocations = await getConvocations();
  return [...convocations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// Get convocations with candidates (for dashboard count)
export const getConvocationsWithCandidates = async (): Promise<Convocation[]> => {
  const convocations = await getConvocations();
  return convocations.filter(c => c.hasCalled && c.calledCandidates && c.calledCandidates.length > 0);
};
