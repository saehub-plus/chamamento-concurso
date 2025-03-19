
import React from 'react';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

interface PredictionDetailsProps {
  prediction: {
    date: string | null;
    businessDays: number;
    averageCallsPerDay: {
      overall: number;
      last30Days: number;
      last90Days: number;
      dynamic: number;
    };
    remainingCalls: number;
    confidence: 'high' | 'medium' | 'low';
  };
}

export function PredictionDetails({ prediction }: PredictionDetailsProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 gap-3">
        {prediction.date && (
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Previsão para chamamento
              </div>
              <div className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                {prediction.confidence === 'high' ? 'Alta confiança' : 
                 prediction.confidence === 'medium' ? 'Média confiança' : 'Baixa confiança'}
              </div>
            </div>
            <div className="font-semibold mt-1">{prediction.date}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Aproximadamente {prediction.businessDays} dias úteis
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Média de chamamentos por dia
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Geral:</span>
                <span className="font-medium">{prediction.averageCallsPerDay.overall}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Últimos 30 dias:</span>
                <span className="font-medium">{prediction.averageCallsPerDay.last30Days}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Últimos 90 dias:</span>
                <span className="font-medium">{prediction.averageCallsPerDay.last90Days}</span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t">
                <span className="text-xs font-medium">Média ponderada:</span>
                <span className="font-semibold text-primary">{prediction.averageCallsPerDay.dynamic}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Situação atual
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Candidatos à sua frente:</span>
                <span className="font-medium">{prediction.remainingCalls}</span>
              </div>
              
              <div className="mt-4 pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  A previsão considera o histórico de chamamentos e calcula uma média dinâmica, priorizando os dados mais recentes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
