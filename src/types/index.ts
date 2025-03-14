
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
}

export interface Convocation {
  id: string;
  date: string;
  hasCalled: boolean;
  calledCandidates: string[]; // Array of candidate IDs
  notes?: string;
  createdAt: string;
}

export interface StatusCount {
  classified: number;
  called: number;
  withdrawn: number;
  eliminated: number;
  appointed: number;
}
