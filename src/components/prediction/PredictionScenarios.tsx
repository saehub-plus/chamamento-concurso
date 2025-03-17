
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { PredictionScenarios as PredictionScenariosType } from '@/types';
import { FrownIcon, MehIcon, SmileIcon } from 'lucide-react';

interface PredictionScenariosProps {
  scenarios: PredictionScenariosType;
}

export function PredictionScenarios({ scenarios }: PredictionScenariosProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Indeterminado';
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Cenários de Previsão</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-red-700">Cenário Pessimista</div>
              <FrownIcon className="h-4 w-4 text-red-600" />
            </div>
            <div className="font-medium text-sm text-red-800">
              {formatDate(scenarios.pessimistic.date)}
            </div>
            <div className="text-xs text-red-600 mt-1">
              {scenarios.pessimistic.businessDays} dias úteis
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-100 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-yellow-700">Cenário Realista</div>
              <MehIcon className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="font-medium text-sm text-yellow-800">
              {formatDate(scenarios.realistic.date)}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              {scenarios.realistic.businessDays} dias úteis
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-100 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-green-700">Cenário Otimista</div>
              <SmileIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-medium text-sm text-green-800">
              {formatDate(scenarios.optimistic.date)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {scenarios.optimistic.businessDays} dias úteis
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
