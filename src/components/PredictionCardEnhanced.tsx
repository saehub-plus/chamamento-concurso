
import React from 'react';
import { PredictionCard } from '@/components/PredictionCard';
import { DocumentWarningsAlert } from '@/components/prediction/DocumentWarningsAlert';
import { PredictionScenarios } from '@/components/prediction/PredictionScenarios';
import { AvailablePositions } from '@/components/prediction/AvailablePositions';
import { getCurrentUserId, getCandidateById, predictCandidateCall } from '@/utils/storage';

export function PredictionCardEnhanced() {
  // Get prediction date for document warnings
  const currentUserId = getCurrentUserId();
  let predictedDate: Date | null = null;
  let hasScenarios = false;
  let scenarios = {
    pessimistic: { date: null, businessDays: 0 },
    realistic: { date: null, businessDays: 0 },
    optimistic: { date: null, businessDays: 0 }
  };
  
  if (currentUserId) {
    const candidate = getCandidateById(currentUserId);
    if (candidate) {
      const prediction = predictCandidateCall(candidate.position);
      predictedDate = prediction.predictedDate;
      scenarios = prediction.scenarios;
      hasScenarios = true;
    }
  }
  
  return (
    <div className="space-y-4">
      <PredictionCard />
      <DocumentWarningsAlert predictedDate={predictedDate} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasScenarios && (
          <PredictionScenarios scenarios={scenarios} />
        )}
        <AvailablePositions />
      </div>
    </div>
  );
}
