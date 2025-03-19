
import { getConvocations } from './convocationStorage';
import { getCandidates } from './candidateStorage';
import { addBusinessDays, differenceInBusinessDays, isWeekend, subBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getDocumentsWithProblems, getDocumentsExpiringBeforeDate } from './documentStorage';
import { Document } from '@/types';

// Check if a date is a business day (not weekend)
const isBusinessDay = (date: Date): boolean => {
  return !isWeekend(date);
};

// Calculate total candidates called up to a specific date
const getCandidatesCalledByDate = () => {
  const convocations = getConvocations();
  const candidates = getCandidates();

  // Map of date -> number of candidates called
  const dateMap: { [key: string]: number } = {};

  // Get called candidates with their dates
  const calledCandidates = candidates.filter(c =>
    c.status === 'called' || c.status === 'appointed'
  );

  // Create a sorted list of all business days from the first to the last convocation
  const sortedConvocations = [...convocations]
    .filter(c => c.hasCalled)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedConvocations.length === 0) {
    return [];
  }

  // For each convocation with calls, record how many candidates were called
  sortedConvocations.forEach(convocation => {
    const dateStr = new Date(convocation.date).toISOString().split('T')[0];
    const candidatesCalled = convocation.calledCandidates?.length || 0;
    dateMap[dateStr] = (dateMap[dateStr] || 0) + candidatesCalled;
  });

  // Convert to array of {date, totalCalled}
  const result = Object.entries(dateMap).map(([dateStr, called]) => ({
    date: new Date(dateStr),
    called,
  }));

  // Sort by date
  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Add cumulative total
  let cumulativeTotal = 0;
  const finalResult = result.map(item => {
    cumulativeTotal += item.called;
    return {
      date: item.date,
      called: item.called,
      cumulativeTotal
    };
  });

  return finalResult;
};

// Calculate regression slope for call rate
const calculateRegressionSlope = (data: { date: Date; cumulativeTotal: number }[]): number => {
  if (data.length < 2) return 0;

  // Use only business days for x-axis
  const baseDate = data[0].date;
  const points = data.map(point => ({
    x: differenceInBusinessDays(point.date, baseDate),
    y: point.cumulativeTotal
  }));

  // Simple linear regression
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  const n = points.length;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  // Calculate slope (calls per business day)
  if (sumXX === sumX * sumX / n) {
    return 0; // Avoid division by zero
  }

  const slope = (sumXY - (sumX * sumY) / n) / (sumXX - (sumX * sumX) / n);
  return slope;
};

// Calculate recent average call rates (last 30 and 90 business days)
const calculateRecentAverages = (data: { date: Date; called: number; cumulativeTotal: number }[]) => {
  if (data.length === 0) {
    return { last30Days: 0, last90Days: 0 };
  }

  const today = new Date();
  const last30BusinessDays = data.filter(item =>
    differenceInBusinessDays(today, item.date) <= 30
  );

  const last90BusinessDays = data.filter(item =>
    differenceInBusinessDays(today, item.date) <= 90
  );

  // Calculate totals
  const total30Days = last30BusinessDays.reduce((sum, item) => sum + item.called, 0);
  const total90Days = last90BusinessDays.reduce((sum, item) => sum + item.called, 0);

  // Calculate averages per business day
  const days30 = last30BusinessDays.length > 0 ? last30BusinessDays.length : 1;
  const days90 = last90BusinessDays.length > 0 ? last90BusinessDays.length : 1;

  return {
    last30Days: total30Days / days30,
    last90Days: total90Days / days90
  };
};

// Calculate weighted dynamic average
const calculateDynamicAverage = (recent: { last30Days: number, last90Days: number }, regression: number) => {
  // If we don't have enough data, default to regression or a small positive number
  if (recent.last30Days === 0 && recent.last90Days === 0) {
    return Math.max(regression, 0.1);
  }

  // Weight recent data more heavily (70% last 30 days, 30% last 90 days)
  const weight30 = 0.7;
  const weight90 = 0.3;

  // If one of the periods has no data, use the other
  if (recent.last30Days === 0) {
    return recent.last90Days;
  }
  if (recent.last90Days === 0) {
    return recent.last30Days;
  }

  return (recent.last30Days * weight30) + (recent.last90Days * weight90);
};

// Calculate call prediction based on historical data
export const predictCandidateCall = (candidatePosition: number): {
  predictedDate: Date | null;
  estimatedBusinessDays: number;
  averageCallsPerDay: {
    overall: number;
    last30Days: number;
    last90Days: number;
    dynamic: number;
  };
  remainingCalls: number;
  confidence: 'high' | 'medium' | 'low';
  scenarios: {
    pessimistic: { date: Date | null; businessDays: number };
    realistic: { date: Date | null; businessDays: number };
    optimistic: { date: Date | null; businessDays: number };
  }
} => {
  console.log("[predictCandidateCall] Início do cálculo para posição:", candidatePosition);

  const convocations = getConvocations();
  const candidates = getCandidates();

  // No convocations yet
  if (convocations.length === 0) {
    console.log("[predictCandidateCall] Nenhuma convocação encontrada.");
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      averageCallsPerDay: {
        overall: 0,
        last30Days: 0,
        last90Days: 0,
        dynamic: 0
      },
      remainingCalls: 0,
      confidence: 'low',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 }
      }
    };
  }

  // Get data for analysis
  const calledData = getCandidatesCalledByDate();
  console.log("[predictCandidateCall] Dados de chamados:", calledData);

  if (calledData.length === 0) {
    console.log("[predictCandidateCall] Nenhum dado de chamados disponível.");
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      averageCallsPerDay: {
        overall: 0,
        last30Days: 0,
        last90Days: 0,
        dynamic: 0
      },
      remainingCalls: 0,
      confidence: 'low',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 }
      }
    };
  }

  // Calculate metrics
  const regressionSlope = calculateRegressionSlope(calledData);
  console.log("[predictCandidateCall] Regression slope:", regressionSlope);

  const recentAverages = calculateRecentAverages(calledData);
  console.log("[predictCandidateCall] Recent averages:", recentAverages);

  const dynamicAverage = calculateDynamicAverage(recentAverages, regressionSlope);
  console.log("[predictCandidateCall] Dynamic average:", dynamicAverage);

  // Get the highest position that has been called
  const highestCalledPosition = Math.max(
    0,
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => c.position)
  );

  console.log("[predictCandidateCall] Highest called position:", highestCalledPosition);

  // Calculate remaining calls before reaching the candidate
  const remainingCalls = candidatePosition - highestCalledPosition;
  console.log("[predictCandidateCall] Remaining calls:", remainingCalls);

  // If candidate is already called or position is invalid
  if (remainingCalls <= 0) {
    console.log("[predictCandidateCall] Candidato já chamado ou posição inválida.");
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      averageCallsPerDay: {
        overall: regressionSlope,
        last30Days: recentAverages.last30Days,
        last90Days: recentAverages.last90Days,
        dynamic: dynamicAverage
      },
      remainingCalls: 0,
      confidence: 'high',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 }
      }
    };
  }

  // Calculate business days until call using different scenarios
  const realisticRate = dynamicAverage > 0 ? dynamicAverage : 0.1;
  const pessimisticRate = realisticRate * 0.6; // 60% of realistic rate
  const optimisticRate = realisticRate * 1.5; // 150% of realistic rate

  const realisticDays = Math.ceil(remainingCalls / realisticRate);
  const pessimisticDays = Math.ceil(remainingCalls / pessimisticRate);
  const optimisticDays = Math.ceil(remainingCalls / optimisticRate);

  console.log("[predictCandidateCall] Dias estimados (realista):", realisticDays);

  // Get the most recent convocation date
  const sortedConvocations = [...convocations].filter(c => c.hasCalled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let baseDate = new Date();
  if (sortedConvocations.length > 0) {
    const lastConvocationDate = new Date(sortedConvocations[0].date);
    baseDate = lastConvocationDate > new Date() ? lastConvocationDate : new Date();
  }

  // Calculate predicted dates for each scenario
  const realisticDate = addBusinessDays(baseDate, realisticDays);
  const pessimisticDate = addBusinessDays(baseDate, pessimisticDays);
  const optimisticDate = addBusinessDays(baseDate, optimisticDays);

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (calledData.length > 5 && dynamicAverage > 0) {
    confidence = 'high';
  } else if (calledData.length > 2 && dynamicAverage > 0) {
    confidence = 'medium';
  }

  console.log("[predictCandidateCall] Previsão calculada:", {
    predictedDate: realisticDate,
    estimatedBusinessDays: realisticDays,
    remainingCalls,
    confidence,
  });

  return {
    predictedDate: realisticDate,
    estimatedBusinessDays: realisticDays,
    averageCallsPerDay: {
      overall: parseFloat(regressionSlope.toFixed(2)),
      last30Days: parseFloat(recentAverages.last30Days.toFixed(2)),
      last90Days: parseFloat(recentAverages.last90Days.toFixed(2)),
      dynamic: parseFloat(realisticRate.toFixed(2))
    },
    remainingCalls,
    confidence,
    scenarios: {
      pessimistic: {
        date: pessimisticDate,
        businessDays: pessimisticDays
      },
      realistic: {
        date: realisticDate,
        businessDays: realisticDays
      },
      optimistic: {
        date: optimisticDate,
        businessDays: optimisticDays
      }
    }
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

// Get document warnings for predicted call date
export const getDocumentWarnings = (predictedDate: Date | null): {
  criticalDocuments: Document[];
  expiringDocuments: Document[];
} => {
  if (!predictedDate) {
    return {
      criticalDocuments: [],
      expiringDocuments: []
    };
  }

  // Get documents with problems (missing, expired, incomplete)
  const criticalDocuments = getDocumentsWithProblems();

  // Get documents that will expire before or shortly after the predicted date
  const expiringDocuments = getDocumentsExpiringBeforeDate(predictedDate, 15);

  return {
    criticalDocuments,
    expiringDocuments
  };
};

// Calculate available positions based on withdrawals and eliminations
export const getAvailablePositions = (): number => {
  const candidates = getCandidates();

  // Count candidates by status
  const eliminated = candidates.filter(c => c.status === 'eliminated').length;
  const withdrawn = candidates.filter(c => c.status === 'withdrawn').length;
  const called = candidates.filter(c => c.status === 'called' || c.status === 'appointed').length;

  // Calculate available positions
  return (eliminated + withdrawn) - called;
};
