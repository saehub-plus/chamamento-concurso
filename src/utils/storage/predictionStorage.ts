
import { getConvocations } from './convocationStorage';
import { getCandidates } from './candidateStorage';

// Calculate call prediction based on historical data
export const predictCandidateCall = (candidatePosition: number): { 
  predictedDate: Date | null;
  callsPerMonth: number;
  remainingCalls: number;
  confidence: 'high' | 'medium' | 'low';
} => {
  const convocations = getConvocations();
  const candidates = getCandidates();
  
  // No convocations yet
  if (convocations.length === 0) {
    return { 
      predictedDate: null, 
      callsPerMonth: 0, 
      remainingCalls: 0,
      confidence: 'low'
    };
  }
  
  // Get called and classified candidates
  const calledCount = candidates.filter(c => c.status === 'called' || c.status === 'appointed').length;
  const classifiedBeforePosition = candidates.filter(c => c.status === 'classified' && c.position < candidatePosition).length;
  
  // Get date range of convocations
  const dates = convocations
    .filter(c => c.hasCalled)
    .map(c => new Date(c.date).getTime());
  
  if (dates.length < 2) {
    return { 
      predictedDate: null, 
      callsPerMonth: 0, 
      remainingCalls: classifiedBeforePosition,
      confidence: 'low'
    };
  }
  
  const oldestDate = Math.min(...dates);
  const newestDate = Math.max(...dates);
  const monthsDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24 * 30);
  
  // Calculate calls per month
  const callsPerMonth = monthsDiff > 0 ? calledCount / monthsDiff : 0;
  
  // Predict date
  const remainingCalls = classifiedBeforePosition;
  const monthsUntilCall = callsPerMonth > 0 ? remainingCalls / callsPerMonth : 0;
  
  let predictedDate = null;
  if (monthsUntilCall > 0) {
    predictedDate = new Date();
    predictedDate.setMonth(predictedDate.getMonth() + monthsUntilCall);
  }
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (convocations.length > 5 && monthsDiff > 3) {
    confidence = 'high';
  } else if (convocations.length > 2) {
    confidence = 'medium';
  }
  
  return {
    predictedDate,
    callsPerMonth: parseFloat(callsPerMonth.toFixed(1)),
    remainingCalls,
    confidence
  };
};

// Get progress to being called (percentage)
export const getCallProgress = (candidatePosition: number): number => {
  const candidates = getCandidates();
  
  if (candidates.length === 0) return 0;
  
  // Find highest called position
  const highestCalledPosition = Math.max(
    0,
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => c.position)
  );
  
  if (highestCalledPosition === 0) return 0;
  
  // Calculate progress
  const progress = (highestCalledPosition / candidatePosition) * 100;
  return Math.min(99, progress); // Cap at 99% until actually called
};
