
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, Hourglass, TimerOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScenarioInfo } from '@/types';
import { Info } from 'lucide-react';

interface PredictionScenariosProps {
  scenarios: {
    pessimistic: ScenarioInfo;
    realistic: ScenarioInfo;
    optimistic: ScenarioInfo;
  };
}

export function PredictionScenarios({ scenarios }: PredictionScenariosProps) {
  const calculateTooltipText = (scenario: string) => {
    switch (scenario) {
      case 'pessimistic':
        return 'Previsão baseada na média de chamamento mais lenta observada, considerando períodos de atraso nas convocações.';
      case 'realistic':
        return 'Previsão baseada na média histórica de chamamento, calculada a partir do ritmo de convocações observado.';
      case 'optimistic':
        return 'Previsão baseada na média de chamamento mais rápida observada, considerando períodos de aceleração nas convocações.';
      default:
        return '';
    }
  };
  
  return (
    <Card className="bg-primary/5 rounded-lg">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground flex items-center mb-3">
          <Clock className="h-4 w-4 mr-1" />
          Cenários de Previsão
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TimerOff className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Pessimista:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{calculateTooltipText('pessimistic')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm">
              {scenarios.pessimistic.date ? (
                <span className="font-semibold">
                  {format(scenarios.pessimistic.date, 'dd/MM/yyyy')}
                </span>
              ) : (
                <span className="text-muted-foreground">Não disponível</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Hourglass className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Realista:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{calculateTooltipText('realistic')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm">
              {scenarios.realistic.date ? (
                <span className="font-semibold">
                  {format(scenarios.realistic.date, 'dd/MM/yyyy')}
                </span>
              ) : (
                <span className="text-muted-foreground">Não disponível</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Otimista:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{calculateTooltipText('optimistic')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm">
              {scenarios.optimistic.date ? (
                <span className="font-semibold">
                  {format(scenarios.optimistic.date, 'dd/MM/yyyy')}
                </span>
              ) : (
                <span className="text-muted-foreground">Não disponível</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-3">
          Estas previsões são baseadas no seu posicionamento atual na lista de candidatos e no histórico de convocações.
        </div>
      </CardContent>
    </Card>
  );
}
