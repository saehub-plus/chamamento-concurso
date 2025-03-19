import { getConvocations } from './convocationStorage';
import { getCandidates } from './candidateStorage';
import { addBusinessDays, differenceInBusinessDays, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getDocumentsWithProblems, getDocumentsExpiringBeforeDate } from './documentStorage';
import { Document } from '@/types';

/** Verifica se uma data é dia útil (não é fim de semana) */
const isBusinessDay = (date: Date): boolean => !isWeekend(date);

/** Retorna os dados de chamados agrupados por data (com total acumulado) */
export const getCandidatesCalledByDate = (): { date: Date; called: number; cumulativeTotal: number }[] => {
  const convocations = getConvocations();
  const dateMap: { [key: string]: number } = {};

  // Considera apenas as convocations com chamada
  const sortedConvocations = convocations
    .filter(c => c.hasCalled)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedConvocations.length === 0) return [];

  sortedConvocations.forEach(convocation => {
    const dateStr = new Date(convocation.date).toISOString().split('T')[0];
    // Converte para número para evitar erro de soma de string com número
    const candidatesCalled = Array.isArray(convocation.calledCandidates)
      ? Number(convocation.calledCandidates[0]) || 0
      : 0;
    dateMap[dateStr] = (dateMap[dateStr] || 0) + candidatesCalled;
  });

  const result = Object.entries(dateMap).map(([dateStr, called]) => ({
    date: new Date(dateStr),
    called,
  }));

  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  let cumulativeTotal = 0;
  const finalResult = result.map(item => {
    cumulativeTotal += item.called;
    return {
      date: item.date,
      called: item.called,
      cumulativeTotal,
    };
  });

  return finalResult;
};

/** Diferença de dias úteis entre duas datas */
export const differenceInBusinessDaysCustom = (date1: Date, date2: Date): number => {
  const diff = Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
  let count = 0;
  const current = new Date(date2);
  for (let i = 0; i < diff; i++) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current)) count++;
  }
  return count;
};

/** Regressão linear simples – também utilizada pelo modelo ARIMA */
export const linearRegression = (x: number[], y: number[]): { slope: number; intercept: number } => {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

/** Calcula o slope da regressão linear usando os dias úteis e o total acumulado */
export const calculateRegressionSlope = (data: { date: Date; cumulativeTotal: number }[]): number => {
  if (data.length < 2) return 0;
  const baseDate = data[0].date;
  const points = data.map(point => ({
    x: differenceInBusinessDaysCustom(point.date, baseDate),
    y: point.cumulativeTotal,
  }));
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
    sumXY += points[i].x * points[i].y;
    sumXX += points[i].x * points[i].x;
  }
  if (sumXX === (sumX * sumX) / n) return 0;
  return (sumXY - (sumX * sumY) / n) / (sumXX - (sumX * sumX) / n);
};

/** Calcula as médias recentes (últimos 30 e 90 dias úteis) */
export const calculateRecentAverages = (data: { date: Date; called: number; cumulativeTotal: number }[]) => {
  if (data.length === 0) return { last30Days: 0, last90Days: 0 };
  const today = new Date();
  const last30 = data.filter(item => differenceInBusinessDaysCustom(today, item.date) <= 30);
  const last90 = data.filter(item => differenceInBusinessDaysCustom(today, item.date) <= 90);
  const total30 = last30.reduce((sum, item) => sum + item.called, 0);
  const total90 = last90.reduce((sum, item) => sum + item.called, 0);
  const days30 = last30.length > 0 ? last30.length : 1;
  const days90 = last90.length > 0 ? last90.length : 1;
  return { last30Days: total30 / days30, last90Days: total90 / days90 };
};

/** Calcula a média dinâmica ponderada */
export const calculateDynamicAverage = (recent: { last30Days: number; last90Days: number }, regression: number): number => {
  if (recent.last30Days === 0 && recent.last90Days === 0) return Math.max(regression, 0.1);
  const weight30 = 0.7, weight90 = 0.3;
  if (recent.last30Days === 0) return recent.last90Days;
  if (recent.last90Days === 0) return recent.last30Days;
  return (recent.last30Days * weight30) + (recent.last90Days * weight90);
};

/**
 * Modelo ARIMA(1,1,0):
 *
 * 1. Calcula a série de diferenças: d_t = Y_t - Y_{t-1} (a partir dos totais acumulados).
 * 2. Ajusta um modelo AR(1) em d_t, ou seja, estima φ via regressão linear de d_t em d_{t-1}.
 * 3. Para previsão de h passos à frente, utiliza a fórmula:
 *    d_{n+i} = φ^i * d_n
 * 4. A previsão cumulativa para h dias úteis é: Y_n + (d_n * (φ * (1 - φ^h)) / (1 - φ))
 * 5. Incrementa h (dias úteis) até que a previsão cumulativa atinja ou ultrapasse a posição desejada.
 *
 * Retorna a data prevista (calculada como a data base + h dias úteis), o número de dias úteis estimados,
 * a taxa ARIMA efetiva (forecast) e os chamados restantes.
 */
export const predictCandidateCallARIMA = (candidatePosition: number): {
  predictedDate: Date | null;
  estimatedBusinessDays: number;
  forecast: number;
  remainingCalls: number;
} => {
  const calledData = getCandidatesCalledByDate();
  if (calledData.length < 2) {
    return { predictedDate: null, estimatedBusinessDays: 0, forecast: 0, remainingCalls: 0 };
  }

  // Último valor observado e série de diferenças
  const lastData = calledData[calledData.length - 1];
  const Y_n = lastData.cumulativeTotal;
  const differences: number[] = [];
  for (let i = 1; i < calledData.length; i++) {
    differences.push(calledData[i].cumulativeTotal - calledData[i - 1].cumulativeTotal);
  }
  if (differences.length < 2) {
    return { predictedDate: null, estimatedBusinessDays: 0, forecast: 0, remainingCalls: 0 };
  }

  // Ajuste AR(1): regressão de d_t em d_{t-1}
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 1; i < differences.length; i++) {
    x.push(Number(differences[i - 1]));
    y.push(Number(differences[i]));
  }
  const lrResult = linearRegression(x, y);
  const phi = lrResult.slope;
  const d_n = differences[differences.length - 1];

  // Previsão para o próximo dia (passo único)
  let forecastRate = phi * d_n;
  if (forecastRate <= 0) {
    const count = Math.min(5, differences.length);
    const sum = differences.slice(-count).reduce((acc, val) => acc + Number(val), 0);
    forecastRate = sum / count;
  }

  // Obtém a posição máxima já chamada
  const candidates = getCandidates();
  const highestCalledPosition = Math.max(
    0,
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => Number(c.position))
  );
  const remainingCalls = candidatePosition - highestCalledPosition;
  if (remainingCalls <= 0) {
    return { predictedDate: null, estimatedBusinessDays: 0, forecast: forecastRate, remainingCalls: 0 };
  }

  // Modelo ARIMA multi‑passo: procura o menor h (dias úteis) para que
  // Y_n + (d_n * (φ*(1 - φ^h))/(1 - φ)) >= candidatePosition.
  let h = 1;
  let cumulativeForecast = 0;
  if (phi !== 1) {
    cumulativeForecast = d_n * (phi * (1 - Math.pow(phi, h))) / (1 - phi);
  } else {
    cumulativeForecast = h * d_n;
  }
  while (Y_n + cumulativeForecast < candidatePosition) {
    h++;
    if (phi !== 1) {
      cumulativeForecast = d_n * (phi * (1 - Math.pow(phi, h))) / (1 - phi);
    } else {
      cumulativeForecast = h * d_n;
    }
    if (h > 1000) break; // Evita loop infinito
  }
  const estimatedBusinessDays = h;

  // Define a data base como a data da última convocação (se houver) ou hoje
  const convocations = getConvocations();
  const sortedConvocations = convocations.filter(c => c.hasCalled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let baseDate = new Date();
  if (sortedConvocations.length > 0) {
    const lastConvocationDate = new Date(sortedConvocations[0].date);
    baseDate = lastConvocationDate > new Date() ? lastConvocationDate : new Date();
  }
  const predictedDate = addBusinessDays(baseDate, estimatedBusinessDays);
  const effectiveForecastRate = estimatedBusinessDays > 0 ? cumulativeForecast / estimatedBusinessDays : forecastRate;

  return {
    predictedDate,
    estimatedBusinessDays,
    forecast: parseFloat(effectiveForecastRate.toFixed(2)),
    remainingCalls,
  };
};

/** Calcula a previsão "do Site" usando a lógica atual de regressão e médias */
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
  };
} => {
  const convocations = getConvocations();
  if (convocations.length === 0) {
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      averageCallsPerDay: { overall: 0, last30Days: 0, last90Days: 0, dynamic: 0 },
      remainingCalls: 0,
      confidence: 'low',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 },
      },
    };
  }

  const calledData = getCandidatesCalledByDate();
  if (calledData.length === 0) {
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      averageCallsPerDay: { overall: 0, last30Days: 0, last90Days: 0, dynamic: 0 },
      remainingCalls: 0,
      confidence: 'low',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 },
      },
    };
  }

  const regressionSlope = calculateRegressionSlope(calledData);
  const recentAverages = calculateRecentAverages(calledData);
  const dynamicAvg = calculateDynamicAverage(recentAverages, regressionSlope);
  const candidates = getCandidates();
  const highestCalledPosition = Math.max(
    0,
    ...candidates.filter(c => c.status === 'called' || c.status === 'appointed').map(c => Number(c.position))
  );
  const remainingCalls = candidatePosition - highestCalledPosition;
  if (remainingCalls <= 0) {
    return {
      predictedDate: null,
      estimatedBusinessDays: 0,
      averageCallsPerDay: {
        overall: regressionSlope,
        last30Days: recentAverages.last30Days,
        last90Days: recentAverages.last90Days,
        dynamic: dynamicAvg,
      },
      remainingCalls: 0,
      confidence: 'high',
      scenarios: {
        pessimistic: { date: null, businessDays: 0 },
        realistic: { date: null, businessDays: 0 },
        optimistic: { date: null, businessDays: 0 },
      },
    };
  }

  const realisticRate = dynamicAvg > 0 ? dynamicAvg : 0.1;
  const pessimisticRate = realisticRate * 0.6;
  const optimisticRate = realisticRate * 1.5;
  const realisticDays = Math.ceil(remainingCalls / realisticRate);
  const pessimisticDays = Math.ceil(remainingCalls / pessimisticRate);
  const optimisticDays = Math.ceil(remainingCalls / optimisticRate);
  const sortedConvocations = convocations.filter(c => c.hasCalled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let baseDate = new Date();
  if (sortedConvocations.length > 0) {
    const lastConvocationDate = new Date(sortedConvocations[0].date);
    baseDate = lastConvocationDate > new Date() ? lastConvocationDate : new Date();
  }
  const realisticDate = addBusinessDays(baseDate, realisticDays);
  const pessimisticDate = addBusinessDays(baseDate, pessimisticDays);
  const optimisticDate = addBusinessDays(baseDate, optimisticDays);
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (calledData.length > 5 && dynamicAvg > 0) {
    confidence = 'high';
  } else if (calledData.length > 2 && dynamicAvg > 0) {
    confidence = 'medium';
  }
  return {
    predictedDate: realisticDate,
    estimatedBusinessDays: realisticDays,
    averageCallsPerDay: {
      overall: parseFloat(regressionSlope.toFixed(2)),
      last30Days: parseFloat(recentAverages.last30Days.toFixed(2)),
      last90Days: parseFloat(recentAverages.last90Days.toFixed(2)),
      dynamic: parseFloat(realisticRate.toFixed(2)),
    },
    remainingCalls,
    confidence,
    scenarios: {
      pessimistic: { date: pessimisticDate, businessDays: pessimisticDays },
      realistic: { date: realisticDate, businessDays: realisticDays },
      optimistic: { date: optimisticDate, businessDays: optimisticDays },
    },
  };
};

/** Calcula o progresso para ser chamado (porcentagem) */
export const getCallProgress = (candidatePosition: number): number => {
  const candidates = getCandidates();
  if (candidates.length === 0) return 0;
  const highestCalledPosition = Math.max(
    0,
    ...candidates
      .filter(c => c.status === 'called' || c.status === 'appointed')
      .map(c => Number(c.position))
  );
  if (highestCalledPosition === 0) return 0;
  const progress = (highestCalledPosition / candidatePosition) * 100;
  return Math.min(99, progress);
};

/** Obtém avisos sobre documentos com base na data prevista */
export const getDocumentWarnings = (predictedDate: Date | null): {
  criticalDocuments: Document[];
  expiringDocuments: Document[];
} => {
  if (!predictedDate) {
    return { criticalDocuments: [], expiringDocuments: [] };
  }
  const criticalDocuments = getDocumentsWithProblems();
  const expiringDocuments = getDocumentsExpiringBeforeDate(predictedDate, 15);
  return { criticalDocuments, expiringDocuments };
};

/** Calcula as vagas disponíveis com base em retiradas e eliminações */
export const getAvailablePositions = (): number => {
  const candidates = getCandidates();
  const eliminated = candidates.filter(c => c.status === 'eliminated').length;
  const withdrawn = candidates.filter(c => c.status === 'withdrawn').length;
  const called = candidates.filter(c => c.status === 'called' || c.status === 'appointed').length;
  return (eliminated + withdrawn) - called;
};
