
import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentsStatus } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addDays, addMonths, addYears, isAfter, parseISO } from 'date-fns';

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

// Function to get document status statistics
export const getDocumentsStatus = (): DocumentsStatus => {
  const documents = getDocuments();
  const total = documents.length;
  
  // Count completed documents (has document and is valid)
  const completed = documents.filter(doc => doc.hasDocument && doc.isValid).length;
  
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
        isValid: false,
        validityPeriod: '1year',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Hbs ag",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '3months',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Anti Hbs",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '3months',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Vacina DT",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Vacina Tríplice Viral",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Vacina Hepatite B",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Documento de Identidade",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '10years',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "CPF",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Certidão de Quitação Eleitoral",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '30days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Certidão de Registro Civil",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Diploma ou Histórico Escolar",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Registro no Conselho Profissional (SC)",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '5years',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Certidão Negativa Ético-Disciplinar do Conselho",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '30days',
        states: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Comprovante de Quitação da Anuidade do Conselho",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '30days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Certificado de Quitação do Serviço Militar",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Comprovante de Endereço",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '90days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Carteira de Trabalho",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Comprovante de PIS/PASEP",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Declaração de Não Penalidades",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '30days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Declaração de Não Acumulação de Cargos",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '30days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Declaração de Bens",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '30days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Certidão Negativa de Antecedentes Criminais",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        validityPeriod: '90days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    setDocuments(defaultDocuments);
  }

  return {
    documents,
    documentStatus: {
      total: documents.length,
      completed: documents.filter(doc => doc.hasDocument && doc.isValid).length,
      expired: documents.filter(doc => 
        doc.hasDocument && 
        doc.expirationDate && 
        isDocumentExpired(doc)
      ).length,
      missing: documents.filter(doc => !doc.hasDocument).length,
      percentage: documents.length > 0 
        ? Math.round((documents.filter(doc => doc.hasDocument && doc.isValid).length / documents.length) * 100) 
        : 0
    },
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
