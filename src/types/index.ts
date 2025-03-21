
export type CandidateStatus = 
  | 'classified' // Classificado
  | 'called'     // Convocado
  | 'withdrawn'  // Desistente
  | 'eliminated' // Eliminado
  | 'appointed';  // Nomeado

export interface Candidate {
  id: string;
  name: string;
  position: number; // Ranking position
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
  isCurrentUser?: boolean; // Flag to identify the current user
}

export interface Convocation {
  id: string;
  date: string;
  hasCalled: boolean;
  calledCandidates: string[]; // Array of candidate IDs
  notes?: string;
  createdAt: string;
  updatedAt: string; // Adding missing updatedAt property
}

export interface StatusCount {
  classified: number;
  called: number;
  withdrawn: number;
  eliminated: number;
  appointed: number;
}

export interface CallPrediction {
  predictedDate: Date | null;
  callsPerMonth: number;
  remainingCalls: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface Document {
  id: string;
  name: string;
  hasDocument: boolean;
  hasPhysicalCopy: boolean;
  isValid: boolean;
  driveLink?: string;
  expirationDate?: string;
  issueDate?: string;
  validityPeriod?: ValidityPeriod;
  states?: string[]; // For documents that require state selection (e.g., council certifications)
  stateLinks?: Record<string, string>; // Links for each selected state
  stateIssueDates?: Record<string, string>; // Issue dates for each selected state
  stateExpirationDates?: Record<string, string>; // Expiration dates for each selected state
  vaccineDoses?: string[]; // Array of dates for vaccine doses
  userAge?: number; // For Tríplice Viral vaccine
  hasNotarizedCopy?: boolean; // For documents that require notarized signatures
  vaccineDetails?: { // Adding missing vaccineDetails property
    isComplete: boolean;
    doses?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ValidityPeriod = 
  | 'none'         // No expiration
  | '30days'       // 30 days validity
  | '90days'       // 90 days validity
  | '3months'      // 3 months validity
  | '1year'        // 1 year validity
  | '5years'       // 5 years validity
  | '10years';     // 10 years validity

export interface DocumentsStatus {
  total: number;
  completed: number;
  expired: number;
  missing: number;
  vaccineProblem: number; // Required field for vaccine issues
  percentage: number;
}

export interface PredictionScenarios {
  pessimistic: {
    date: Date | null;
    businessDays: number;
  };
  realistic: {
    date: Date | null;
    businessDays: number;
  };
  optimistic: {
    date: Date | null;
    businessDays: number;
  };
}

// Add ScenarioInfo interface for PredictionScenarios component
export interface ScenarioInfo {
  date: Date | null;
  businessDays?: number;
}
