import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { Document, DocumentsStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { addDays, addMonths, addYears, isAfter, parseISO, differenceInDays } from 'date-fns';

const COLLECTION_NAME = "documents";

// Additional function to check if vaccine needs booster
export const needsVaccineBooster = (document: Document): boolean => {
  if (document.name !== "Vacina DT") return false;
  if (!document.vaccineDoses || document.vaccineDoses.length < 3) return false;
  
  const lastDose = parseISO(document.vaccineDoses[document.vaccineDoses.length - 1]);
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  return lastDose < tenYearsAgo;
};

// Function to calculate validity date based on issue date and validity period
export const calculateExpirationDate = (issueDate: string, validityPeriod: string): string | undefined => {
  if (!issueDate) return undefined;
  
  const date = parseISO(issueDate);
  let expirationDate;
  
  switch (validityPeriod) {
    case '30days':
      expirationDate = addDays(date, 30);
      break;
    case '90days':
      expirationDate = addDays(date, 90);
      break;
    case '3months':
      expirationDate = addMonths(date, 3);
      break;
    case '1year':
      expirationDate = addYears(date, 1);
      break;
    case '5years':
      expirationDate = addYears(date, 5);
      break;
    case '10years':
      expirationDate = addYears(date, 10);
      break;
    default:
      return undefined;
  }
  
  return expirationDate.toISOString();
};

// Function to check if a document is expired
export const isDocumentExpired = (document: Document): boolean => {
  if (!document.expirationDate) return false;
  
  const expiryDate = parseISO(document.expirationDate);
  return !isAfter(expiryDate, new Date());
};

// Function to check if a document will expire within X days
export const willExpireSoon = (document: Document, days: number): boolean => {
  if (!document.expirationDate) return false;
  
  const expiryDate = parseISO(document.expirationDate);
  const today = new Date();
  
  if (!isAfter(expiryDate, today)) return false; // Already expired
  
  const daysToExpiry = differenceInDays(expiryDate, today);
  return daysToExpiry <= days;
};

// Function to add document
export const addDocument = async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
  // Calculate expiration date if issue date and validity period are provided
  let expirationDate = document.expirationDate;
  if (document.issueDate && document.validityPeriod && document.validityPeriod !== 'none') {
    expirationDate = calculateExpirationDate(document.issueDate, document.validityPeriod);
  }
  
  const newDocument: Document = {
    ...document,
    expirationDate,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await setDoc(doc(db, COLLECTION_NAME, newDocument.id), newDocument);
  
  // Show toast notification
  toast({
    title: "Documento adicionado",
    description: `${document.name} foi adicionado com sucesso.`
  });
  
  return newDocument;
};

// Function to get all documents
export const getDocuments = async (): Promise<Document[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  
  // If no documents, initialize with default documents
  if (querySnapshot.empty) {
    await initializeDefaultDocuments();
    const newQuerySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return newQuerySnapshot.docs.map(doc => doc.data() as Document);
  }
  
  return querySnapshot.docs.map(doc => doc.data() as Document);
};

// Function to update document
export const updateDocument = async (id: string, document: Partial<Document>): Promise<Document | null> => {
  const documentRef = doc(db, COLLECTION_NAME, id);
  const documentDoc = await getDoc(documentRef);
  
  if (!documentDoc.exists()) return null;
  
  const oldDocument = documentDoc.data() as Document;
  const oldStatus = isDocumentComplete(oldDocument);
  
  // Calculate expiration date if issue date is updated
  let expirationDate = document.expirationDate;
  if (
    document.issueDate && 
    oldDocument.validityPeriod && 
    oldDocument.validityPeriod !== 'none'
  ) {
    expirationDate = calculateExpirationDate(
      document.issueDate, 
      oldDocument.validityPeriod
    );
  }
  
  // Calculate state-specific expirations
  let stateExpirationDates = oldDocument.stateExpirationDates || {};
  if (document.stateIssueDates) {
    const validityPeriod = oldDocument.validityPeriod;
    if (validityPeriod && validityPeriod !== 'none') {
      Object.entries(document.stateIssueDates).forEach(([state, issueDate]) => {
        if (issueDate) {
          stateExpirationDates = {
            ...stateExpirationDates,
            [state]: calculateExpirationDate(issueDate, validityPeriod)
          };
        }
      });
    }
  }
  
  const updatedDocument = {
    ...oldDocument,
    ...document,
    expirationDate: expirationDate || oldDocument.expirationDate,
    stateExpirationDates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(documentRef, updatedDocument);
  
  // Check if the document status changed
  const newStatus = isDocumentComplete(updatedDocument);
  if (oldStatus !== newStatus) {
    toast({
      title: "Status do documento alterado",
      description: newStatus 
        ? `${updatedDocument.name} está completo agora.` 
        : `${updatedDocument.name} está incompleto.`
    });
  }
  
  return updatedDocument;
};

// Function to remove document
export const removeDocument = async (id: string): Promise<boolean> => {
  const documentRef = doc(db, COLLECTION_NAME, id);
  const documentDoc = await getDoc(documentRef);
  
  if (!documentDoc.exists()) return false;
  
  await deleteDoc(documentRef);
  return true;
};

// Check if document is complete according to new rules
export const isDocumentComplete = (document: Document): boolean => {
  // Must have the document
  if (!document.hasDocument) return false;
  
  // Check if document is a vaccine
  const isVaccine = ["Vacina Hepatite B", "Vacina Tríplice Viral", "Vacina DT"].includes(document.name);
  
  // Check for state documents
  const isStateDocument = ["Certidão Negativa Ético-Disciplinar do Conselho", "Comprovante de Quitação da Anuidade do Conselho"].includes(document.name);
  
  // Check for documents requiring notarized copy
  const requiresNotarizedCopy = ["Declaração de Não Penalidades", "Declaração de Não Acumulação de Cargos", "Declaração de Bens"].includes(document.name);
  
  // If expired, it's not complete
  if (document.expirationDate && isDocumentExpired(document)) return false;
  
  // Check for Google Drive link requirement (for all documents including vaccines)
  if (!document.driveLink) return false;
  
  // For state documents, check if all selected states have links and issue dates
  if (isStateDocument) {
    if (!document.states || document.states.length === 0) return false;
    return document.states.every(state => 
      document.stateLinks && 
      document.stateLinks[state] && 
      document.stateLinks[state].trim() !== "" &&
      document.stateIssueDates &&
      document.stateIssueDates[state]
    );
  }
  
  // For vaccines, check if schedule is valid
  if (isVaccine) {
    return isVaccineComplete(document);
  }
  
  // For documents requiring notarized copy
  if (requiresNotarizedCopy && !document.hasNotarizedCopy) {
    return false;
  }
  
  return true;
};

// Function to get document status statistics
export const getDocumentsStatus = async (): Promise<DocumentsStatus> => {
  const documents = await getDocuments();
  const total = documents.length;
  
  // Count completed documents using new completion criteria
  const completed = documents.filter(doc => isDocumentComplete(doc)).length;
  
  // Count expired documents
  const expired = documents.filter(doc => 
    doc.hasDocument && 
    doc.expirationDate && 
    isDocumentExpired(doc)
  ).length;
  
  // Count documents with vaccine problems
  const vaccineProblem = documents.filter(doc => hasVaccineProblem(doc)).length;
  
  // Count missing documents
  const missing = documents.filter(doc => !doc.hasDocument).length;
  
  // Calculate completion percentage
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

// Check if vaccine document is complete
export const isVaccineComplete = (document: Document): boolean => {
  if (!document.vaccineDoses || document.vaccineDoses.length === 0) return false;
  if (!document.driveLink) return false; // Vaccines also need Google Drive link
  
  if (document.name === "Vacina Hepatite B") {
    if (document.vaccineDoses.length !== 3) return false;
    
    const firstDose = parseISO(document.vaccineDoses[0]);
    const secondDose = parseISO(document.vaccineDoses[1]);
    const thirdDose = parseISO(document.vaccineDoses[2]);
    
    // Second dose should be at least 1 month after first dose
    const secondDoseValid = secondDose.getTime() >= new Date(firstDose.getFullYear(), firstDose.getMonth() + 1, firstDose.getDate()).getTime();
    
    // Third dose should be at least 6 months after first dose
    const thirdDoseValid = thirdDose.getTime() >= new Date(firstDose.getFullYear(), firstDose.getMonth() + 6, firstDose.getDate()).getTime();
    
    return secondDoseValid && thirdDoseValid;
  } 
  else if (document.name === "Vacina DT") {
    if (document.vaccineDoses.length < 3) return false;
    
    // Check for the basic 3-dose schedule
    const firstDose = parseISO(document.vaccineDoses[0]);
    const secondDose = parseISO(document.vaccineDoses[1]);
    const thirdDose = parseISO(document.vaccineDoses[2]);
    
    // 60 days between doses
    const secondDoseValid = secondDose.getTime() >= new Date(firstDose.getFullYear(), firstDose.getMonth(), firstDose.getDate() + 60).getTime();
    const thirdDoseValid = thirdDose.getTime() >= new Date(secondDose.getFullYear(), secondDose.getMonth(), secondDose.getDate() + 60).getTime();
    
    // Check if booster is needed (10 years after last dose)
    const lastDose = parseISO(document.vaccineDoses[document.vaccineDoses.length - 1]);
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    
    const needsBooster = lastDose < tenYearsAgo;
    
    return secondDoseValid && thirdDoseValid && !needsBooster;
  } 
  else if (document.name === "Vacina Tríplice Viral") {
    if (!document.userAge) return false;
    
    // 2 doses for 20-29 years, 1 dose for 30-59 years
    if (document.userAge >= 20 && document.userAge <= 29) {
      return document.vaccineDoses.length >= 2;
    } else if (document.userAge >= 30 && document.userAge <= 59) {
      return document.vaccineDoses.length >= 1;
    }
  }
  
  return false;
};

// Check if document has a vaccine problem
export const hasVaccineProblem = (document: Document): boolean => {
  if (!["Vacina Hepatite B", "Vacina Tríplice Viral", "Vacina DT"].includes(document.name)) return false;
  if (!document.hasDocument) return false;
  
  // If it's a vaccine and not complete, then it has a problem
  return !isVaccineComplete(document);
};

// Check if state document is complete
export const isStateDocumentComplete = (document: Document): boolean => {
  if (!document.states || document.states.length === 0) return false;
  
  // Check if all selected states have links and issue dates
  if (!document.stateLinks || !document.stateIssueDates) return false;
  
  return document.states.every(state => 
    document.stateLinks && 
    document.stateLinks[state] && 
    document.stateLinks[state].trim() !== "" &&
    document.stateIssueDates &&
    document.stateIssueDates[state]
  );
};

// Check if document will expire before a target date
export const willExpireBeforeDate = (document: Document, targetDate: Date): boolean => {
  if (!document.expirationDate) return false;
  
  const expiryDate = parseISO(document.expirationDate);
  return expiryDate < targetDate;
};

// Get documents that will expire before a specified date
export const getDocumentsExpiringBeforeDate = async (targetDate: Date, includeDays: number = 15): Promise<Document[]> => {
  const extendedTargetDate = addDays(targetDate, includeDays);
  const documents = await getDocuments();
  
  return documents.filter(doc => 
    doc.hasDocument && 
    doc.expirationDate && 
    willExpireBeforeDate(doc, extendedTargetDate) && 
    !isDocumentExpired(doc) // Only include non-expired documents
  );
};

// Get all documents with problems (missing, expired, incomplete vaccines)
export const getDocumentsWithProblems = async (): Promise<Document[]> => {
  const documents = await getDocuments();
  
  return documents.filter(doc => {
    // Check for missing documents
    if (!doc.hasDocument) return true;
    
    // Check for expired documents
    if (doc.expirationDate && isDocumentExpired(doc)) return true;
    
    // Check for incomplete vaccine schedules
    const isVaccine = ["Vacina Hepatite B", "Vacina Tríplice Viral", "Vacina DT"].includes(doc.name);
    if (isVaccine && !isVaccineComplete(doc)) return true;
    
    // Check for missing Google Drive links
    if (!isVaccine && !doc.driveLink) return true;
    
    // Check for state documents with missing links or issue dates
    const isStateDocument = ["Certidão Negativa Ético-Disciplinar do Conselho", "Comprovante de Quitação da Anuidade do Conselho"].includes(doc.name);
    if (isStateDocument && !isStateDocumentComplete(doc)) return true;
    
    // Check for documents requiring notarized copy
    const requiresNotarizedCopy = ["Declaração de Não Penalidades", "Declaração de Não Acumulação de Cargos", "Declaração de Bens"].includes(doc.name);
    if (requiresNotarizedCopy && !doc.hasNotarizedCopy) return true;
    
    return false;
  });
};

// Initialize default documents
export const initializeDefaultDocuments = async (): Promise<void> => {
  const defaultDocuments: Document[] = [
    {
      id: uuidv4(),
      name: "Exame de Acuidade Visual",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '1year',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Hbs ag",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '3months',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Anti Hbs",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '3months',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Vacina DT",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      vaccineDoses: [], // Empty array for vaccine doses
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Vacina Tríplice Viral",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      vaccineDoses: [], // Empty array for vaccine doses
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Vacina Hepatite B",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      vaccineDoses: [], // Empty array for vaccine doses
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Documento de Identidade",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '10years',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "CPF",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Certidão de Quitação Eleitoral",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '30days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Certidão de Registro Civil",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Diploma ou Histórico Escolar",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Registro no Conselho Profissional (SC)",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '5years',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Certidão Negativa Ético-Disciplinar do Conselho",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '30days',
      states: [],
      stateLinks: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Comprovante de Quitação da Anuidade do Conselho",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '30days',
      states: [],
      stateLinks: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Certificado de Quitação do Serviço Militar",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Comprovante de Endereço",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '90days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Carteira de Trabalho",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Comprovante de PIS/PASEP",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Declaração de Não Penalidades",
      hasDocument: false,
      hasPhysicalCopy: false,
      hasNotarizedCopy: false,
      isValid: true,
      validityPeriod: '30days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Declaração de Não Acumulação de Cargos",
      hasDocument: false,
      hasPhysicalCopy: false,
      hasNotarizedCopy: false,
      isValid: true,
      validityPeriod: '30days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Declaração de Bens",
      hasDocument: false,
      hasPhysicalCopy: false,
      hasNotarizedCopy: false,
      isValid: true,
      validityPeriod: '30days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: "Certidão Negativa de Antecedentes Criminais",
      hasDocument: false,
      hasPhysicalCopy: false,
      isValid: true,
      validityPeriod: '90days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  // Create batch operations
  const batch = [];
  for (const document of defaultDocuments) {
    batch.push(setDoc(doc(db, COLLECTION_NAME, document.id), document));
  }
  
  await Promise.all(batch);
};
