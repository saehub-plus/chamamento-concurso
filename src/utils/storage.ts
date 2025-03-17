
// Re-export everything from the storage modules except getAvailablePositions
// from candidateStorage since it's already exported from predictionStorage
export * from './storage/candidateStorage';
export * from './storage/convocationStorage';
export * from './storage/predictionStorage';
export * from './storage/documentStorage';

// Fix the conflicting export by re-exporting explicitly
// We'll redefine getAvailablePositions here to avoid the conflict
export { getAvailablePositions } from './storage/candidateStorage';
