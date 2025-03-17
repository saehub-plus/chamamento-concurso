
import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentsStatus } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addDays, addMonths, addYears, isAfter, parseISO, differenceInDays } from 'date-fns';

const STORAGE_KEY = 'documents';

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
export const addDocument = (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document => {
  const documents = getDocuments();
  
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
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...documents, newDocument]));
  
  return newDocument;
};

// Function to get all documents
export const getDocuments = (): Document[] => {
  const documentsJson = localStorage.getItem(STORAGE_KEY);
  return documentsJson ? JSON.parse(documentsJson) : [];
};

// Function to update document
export const updateDocument = (id: string, document: Partial<Document>): Document | null => {
  const documents = getDocuments();
  const documentIndex = documents.findIndex(doc => doc.id === id);
  
  if (documentIndex === -1) return null;
  
  // Calculate expiration date if issue date is updated
  let expirationDate = document.expirationDate;
  if (
    document.issueDate && 
    documents[documentIndex].validityPeriod && 
    documents[documentIndex].validityPeriod !== 'none'
  ) {
    expirationDate = calculateExpirationDate(
      document.issueDate, 
      documents[documentIndex].validityPeriod
    );
  }
  
  const updatedDocument = {
    ...documents[documentIndex],
    ...document,
    expirationDate: expirationDate || documents[documentIndex].expirationDate,
    updatedAt: new Date().toISOString(),
  };
  
  documents[documentIndex] = updatedDocument;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  
  return updatedDocument;
};

// Function to remove document
export const removeDocument = (id: string): boolean => {
  const documents = getDocuments();
  const filteredDocuments = documents.filter(doc => doc.id !== id);
  
  if (filteredDocuments.length === documents.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments));
  return true;
};

// Check if document is complete according to new rules
export const isDocumentComplete = (document: Document): boolean => {
  // Must have the document
  if (!document.hasDocument) return false;
  
  // Check for Google Drive link requirement
  const isStateDocument = ["Certidão Negativa Ético-Disciplinar do Conselho", "Comprovante de Quitação da Anuidade do Conselho"].includes(document.name);
  if (!document.driveLink && !isStateDocument) return false;
  
  // If expired, it's not complete
  if (document.expirationDate && isDocumentExpired(document)) return false;
  
  // For state documents, check if all selected states have links
  if (isStateDocument) {
    if (!document.states || document.states.length === 0) return false;
    return document.states.every(state => 
      document.stateLinks && document.stateLinks[state] && document.stateLinks[state].trim() !== ""
    );
  }
  
  // For vaccines, check if schedule is valid
  const isVaccine = ["Vacina Hepatite B", "Vacina Tríplice Viral", "Vacina DT"].includes(document.name);
  if (isVaccine) {
    return isVaccineComplete(document);
  }
  
  // For documents requiring notarized copy
  const requiresNotarizedCopy = ["Declaração de Não Penalidades", "Declaração de Não Acumulação de Cargos", "Declaração de Bens"].includes(document.name);
  if (requiresNotarizedCopy && !document.hasNotarizedCopy) {
    return false;
  }
  
  return true;
};

// Function to get document status statistics
export const getDocumentsStatus = (): DocumentsStatus => {
  const documents = getDocuments();
  const total = documents.length;
  
  // Count completed documents using new completion criteria
  const completed = documents.filter(doc => isDocumentComplete(doc)).length;
  
  // Count expired documents
  const expired = documents.filter(doc => 
    doc.hasDocument && 
    doc.expirationDate && 
    isDocumentExpired(doc)
  ).length;
  
  // Count missing documents
  const missing = documents.filter(doc => !doc.hasDocument).length;
  
  // Calculate completion percentage
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    expired,
    missing,
    percentage
  };
};

// Check if vaccine document is complete
export const isVaccineComplete = (document: Document): boolean => {
  if (!document.vaccineDoses || document.vaccineDoses.length === 0) return false;
  
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
    if (document.vaccineDoses.length !== 3) return false;
    
    const firstDose = parseISO(document.vaccineDoses[0]);
    const secondDose = parseISO(document.vaccineDoses[1]);
    const thirdDose = parseISO(document.vaccineDoses[2]);
    
    // 60 days between doses
    const secondDoseValid = secondDose.getTime() >= new Date(firstDose.getFullYear(), firstDose.getMonth(), firstDose.getDate() + 60).getTime();
    const thirdDoseValid = thirdDose.getTime() >= new Date(secondDose.getFullYear(), secondDose.getMonth(), secondDose.getDate() + 60).getTime();
    
    return secondDoseValid && thirdDoseValid;
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

// Check if state document is complete
export const isStateDocumentComplete = (document: Document): boolean => {
  if (!document.states || document.states.length === 0) return false;
  
  // Check if all selected states have links
  if (!document.stateLinks) return false;
  
  return document.states.every(state => 
    document.stateLinks && document.stateLinks[state] && document.stateLinks[state].trim() !== ""
  );
};

// Check if document will expire before a target date
export const willExpireBeforeDate = (document: Document, targetDate: Date): boolean => {
  if (!document.expirationDate) return false;
  
  const expiryDate = parseISO(document.expirationDate);
  return expiryDate < targetDate;
};

// Get documents that will expire before a specified date
export const getDocumentsExpiringBeforeDate = (targetDate: Date, includeDays: number = 15): Document[] => {
  const extendedTargetDate = addDays(targetDate, includeDays);
  const documents = getDocuments();
  
  return documents.filter(doc => 
    doc.hasDocument && 
    doc.expirationDate && 
    willExpireBeforeDate(doc, extendedTargetDate) && 
    !isDocumentExpired(doc) // Only include non-expired documents
  );
};

// Get all documents with problems (missing, expired, incomplete vaccines)
export const getDocumentsWithProblems = (): Document[] => {
  const documents = getDocuments();
  
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
    
    // Check for state documents with missing links
    const isStateDocument = ["Certidão Negativa Ético-Disciplinar do Conselho", "Comprovante de Quitação da Anuidade do Conselho"].includes(doc.name);
    if (isStateDocument && !isStateDocumentComplete(doc)) return true;
    
    // Check for documents requiring notarized copy
    const requiresNotarizedCopy = ["Declaração de Não Penalidades", "Declaração de Não Acumulação de Cargos", "Declaração de Bens"].includes(doc.name);
    if (requiresNotarizedCopy && !doc.hasNotarizedCopy) return true;
    
    return false;
  });
};

// Hook to use documents
export const useDocuments = () => {
  const [documents, setDocuments] = useLocalStorage<Document[]>(STORAGE_KEY, []);
  
  // If there are no documents, create the default ones
  if (documents.length === 0) {
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
        vaccineDoses: [],
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
        vaccineDoses: [],
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
        vaccineDoses: [],
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
    
    setDocuments(defaultDocuments);
  }

  // Calculate document status using new completion criteria
  const documentStatus = {
    total: documents.length,
    completed: documents.filter(doc => isDocumentComplete(doc)).length,
    expired: documents.filter(doc => 
      doc.hasDocument && 
      doc.expirationDate && 
      isDocumentExpired(doc)
    ).length,
    missing: documents.filter(doc => !doc.hasDocument).length,
    percentage: documents.length > 0 
      ? Math.round((documents.filter(doc => isDocumentComplete(doc)).length / documents.length) * 100) 
      : 0
  };

  return {
    documents,
    documentStatus,
    addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newDocument = addDocument(document);
      setDocuments([...documents, newDocument]);
      return newDocument;
    },
    updateDocument: (id: string, document: Partial<Document>) => {
      const updatedDocument = updateDocument(id, document);
      if (updatedDocument) {
        setDocuments(documents.map(doc => doc.id === id ? updatedDocument : doc));
      }
      return updatedDocument;
    },
    removeDocument: (id: string) => {
      const isRemoved = removeDocument(id);
      if (isRemoved) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
      return isRemoved;
    }
  };
};
