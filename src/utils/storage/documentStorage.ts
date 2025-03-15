
import { v4 as uuidv4 } from 'uuid';
import { Document } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

const STORAGE_KEY = 'documents';

// Função para adicionar documento
export const addDocument = (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document => {
  const documents = getDocuments();
  
  const newDocument: Document = {
    ...document,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...documents, newDocument]));
  
  return newDocument;
};

// Função para obter todos os documentos
export const getDocuments = (): Document[] => {
  const documentsJson = localStorage.getItem(STORAGE_KEY);
  return documentsJson ? JSON.parse(documentsJson) : [];
};

// Função para atualizar documento
export const updateDocument = (id: string, document: Partial<Document>): Document | null => {
  const documents = getDocuments();
  const documentIndex = documents.findIndex(doc => doc.id === id);
  
  if (documentIndex === -1) return null;
  
  const updatedDocument = {
    ...documents[documentIndex],
    ...document,
    updatedAt: new Date().toISOString(),
  };
  
  documents[documentIndex] = updatedDocument;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  
  return updatedDocument;
};

// Função para remover documento
export const removeDocument = (id: string): boolean => {
  const documents = getDocuments();
  const filteredDocuments = documents.filter(doc => doc.id !== id);
  
  if (filteredDocuments.length === documents.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments));
  return true;
};

// Hook para utilizar documentos
export const useDocuments = () => {
  const [documents, setDocuments] = useLocalStorage<Document[]>(STORAGE_KEY, []);
  
  // Se não existirem documentos, criar os documentos padrão
  if (documents.length === 0) {
    const defaultDocuments: Document[] = [
      {
        id: uuidv4(),
        name: "Exame de Acuidade Visual",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        expirationDate: undefined,
        driveLink: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Hbs ag",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        driveLink: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Anti Hbs",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        driveLink: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Vacina DT",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        driveLink: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Vacina Tríplice Viral",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        driveLink: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "Vacina Hepatite B",
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: false,
        driveLink: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    
    setDocuments(defaultDocuments);
  }

  return {
    documents,
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
