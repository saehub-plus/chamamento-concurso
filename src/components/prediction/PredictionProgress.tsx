
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface PredictionProgressProps {
  progress: number;
}

export function PredictionProgress({ progress }: PredictionProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span>Progresso para Chamamento</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="relative pt-1">
        <Progress value={progress} className="h-4" />
        <div className="flex justify-between absolute w-full bottom-2">
          <div className="h-3 w-3 bg-primary rounded-full mt-1 -ml-1.5"></div>
          {progress > 0 && (
            <div
              className="h-3 w-3 bg-primary rounded-full mt-1 -ml-1.5 relative"
              style={{ left: `${progress}%` }}
            >
              <div className="absolute top-[-24px] left-[-8px]">
                <div className="animate-bounce">
                  <span className="inline-flex justify-center items-center h-6 w-6 rounded-full bg-primary shadow text-white text-xs">
                    Você
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="h-3 w-3 border-2 border-primary rounded-full mt-1 -mr-1.5">
            <Trophy className="h-4 w-4 text-primary absolute -top-6 -right-1.5 transform translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
