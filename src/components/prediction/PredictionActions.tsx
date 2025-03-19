
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { UpdatePredictionDate } from './UpdatePredictionDate';

interface PredictionActionsProps {
  onUpdateDate: (date: Date) => void;
}

export function PredictionActions({ onUpdateDate }: PredictionActionsProps) {
  const [showUpdateDate, setShowUpdateDate] = useState(false);
  
  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setShowUpdateDate(!showUpdateDate)}
      >
        <RefreshCw className="h-4 w-4" />
        {showUpdateDate ? 'Cancelar' : 'Atualizar data de referência'}
      </Button>
      
      {showUpdateDate && (
        <UpdatePredictionDate 
          onUpdateDate={onUpdateDate}
          currentDate={new Date()}
        />
      )}
    </div>
  );
}
