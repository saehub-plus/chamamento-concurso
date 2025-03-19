
import { format, addBusinessDays, differenceInBusinessDays, isSaturday, isSunday, isWeekend } from 'date-fns';
import { getConvocations, getCandidateById } from '@/utils/storage';

/**
 * Calculates the average number of calls per day from convocation data.
 * @returns Object containing different average calculations
 */
export const calculateAverageCallsPerDay = (referenceDate: Date = new Date()) => {
  const convocations = getConvocations();
  
  if (convocations.length <= 1) {
    return {
      overall: 0.5,
      last30Days: 0.5,
      last90Days: 0.5,
      dynamic: 0.5
    };
  }
  
  // Sort convocations by date
  const sortedConvocations = [...convocations].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate total business days between first and last convocation
  const firstDate = new Date(sortedConvocations[0].date);
  const lastDate = new Date(sortedConvocations[sortedConvocations.length - 1].date);
  
  let businessDays = 0;
  let currentDate = new Date(firstDate);
  
  while (currentDate <= lastDate) {
    if (!isWeekend(currentDate)) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate overall average (excluding convocations without candidates)
  const convocationsWithCandidates = sortedConvocations.filter(conv => 
    conv.hasCalled && conv.calledCandidates && conv.calledCandidates.length > 0
  ).length;
  const overallAverage = businessDays > 0 ? convocationsWithCandidates / businessDays : 0.5;
  
  // Calculate 30-day average
  const thirtyDaysAgo = new Date(referenceDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const last30DaysConvocations = sortedConvocations.filter(
    conv => new Date(conv.date) >= thirtyDaysAgo && 
    conv.hasCalled && conv.calledCandidates && conv.calledCandidates.length > 0
  );
  
  const last30DaysBusinessDays = Math.min(businessDays, 22); // ~22 business days in 30 calendar days
  const last30DaysAverage = last30DaysBusinessDays > 0 
    ? last30DaysConvocations.length / last30DaysBusinessDays 
    : overallAverage;
  
  // Calculate 90-day average
  const ninetyDaysAgo = new Date(referenceDate);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const last90DaysConvocations = sortedConvocations.filter(
    conv => new Date(conv.date) >= ninetyDaysAgo && 
    conv.hasCalled && conv.calledCandidates && conv.calledCandidates.length > 0
  );
  
  const last90DaysBusinessDays = Math.min(businessDays, 65); // ~65 business days in 90 calendar days
  const last90DaysAverage = last90DaysBusinessDays > 0 
    ? last90DaysConvocations.length / last90DaysBusinessDays 
    : overallAverage;
  
  // Dynamic weighted average - gives more weight to recent data
  const dynamicAverage = (
    (overallAverage * 1) + 
    (last90DaysAverage * 2) + 
    (last30DaysAverage * 3)
  ) / 6;
  
  return {
    overall: parseFloat(overallAverage.toFixed(2)),
    last30Days: parseFloat(last30DaysAverage.toFixed(2)),
    last90Days: parseFloat(last90DaysAverage.toFixed(2)),
    dynamic: parseFloat(dynamicAverage.toFixed(2))
  };
};

/**
 * Predicts when a candidate will be called based on their position
 * @param position The candidate's position in the list
 * @returns Prediction information
 */
export const predictCandidateCall = (position: number, referenceDate: Date = new Date()) => {
  // Get all convocations and check how many positions are called already
  const convocations = getConvocations();
  const convocationsWithCandidates = convocations.filter(conv => 
    conv.hasCalled && conv.calledCandidates && conv.calledCandidates.length > 0
  );
  
  // Get the highest position called
  let highestPositionCalled = 0;
  
  convocationsWithCandidates.forEach(conv => {
    if (conv.calledCandidates && conv.calledCandidates.length > 0) {
      conv.calledCandidates.forEach(candidateId => {
        const candidate = getCandidateById(candidateId);
        if (candidate && candidate.position > highestPositionCalled) {
          highestPositionCalled = candidate.position;
        }
      });
    }
  });
  
  // Calculate how many positions remain to be called before the given position
  const remainingCalls = position - highestPositionCalled;
  
  if (remainingCalls <= 0) {
    // Candidate has already been called or should have been called
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      remainingCalls: 0,
      averageCallsPerDay: calculateAverageCallsPerDay(referenceDate),
      confidence: 'high' as 'high' | 'medium' | 'low'
    };
  }
  
  // Get average calls per day from historical data
  const averageCalls = calculateAverageCallsPerDay(referenceDate);
  
  // Calculate estimated business days until call
  const estimatedBusinessDays = Math.ceil(remainingCalls / averageCalls.dynamic);
  
  // Determine confidence level based on data quality
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  if (convocationsWithCandidates.length > 20) {
    confidence = 'high';
  } else if (convocationsWithCandidates.length < 5) {
    confidence = 'low';
  }
  
  // Calculate predicted date
  let predictedDate = referenceDate;
  let daysToAdd = estimatedBusinessDays;
  
  while (daysToAdd > 0) {
    predictedDate = new Date(predictedDate.getTime() + 24 * 60 * 60 * 1000);
    if (!isSaturday(predictedDate) && !isSunday(predictedDate)) {
      daysToAdd--;
    }
  }
  
  return {
    predictedDate,
    estimatedBusinessDays,
    remainingCalls,
    averageCallsPerDay: averageCalls,
    confidence
  };
};

/**
 * Calculates the progress percentage for a candidate's position
 * @param position The candidate's position
 * @returns Progress percentage (0-100)
 */
export const getCallProgress = (position: number) => {
  // Get total number of candidates
  const convocations = getConvocations();
  const convocationsWithCandidates = convocations.filter(conv => 
    conv.hasCalled && conv.calledCandidates && conv.calledCandidates.length > 0
  );
  
  // Get the highest position called
  let highestPositionCalled = 0;
  
  convocationsWithCandidates.forEach(conv => {
    if (conv.calledCandidates && conv.calledCandidates.length > 0) {
      conv.calledCandidates.forEach(candidateId => {
        const candidate = getCandidateById(candidateId);
        if (candidate && candidate.position > highestPositionCalled) {
          highestPositionCalled = candidate.position;
        }
      });
    }
  });
  
  // Current position compared to highest position called
  const progress = (highestPositionCalled / position) * 100;
  
  return Math.min(Math.max(0, progress), 100); // Ensure progress is between 0 and 100
};
