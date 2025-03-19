
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PredictionActionsProps {
  onUpdateDate: () => void;
}

export function PredictionActions({ onUpdateDate }: PredictionActionsProps) {
  const handleRecalculate = () => {
    onUpdateDate();
    toast({
      title: "Previsão atualizada",
      description: "A previsão de chamamento foi recalculada com sucesso."
    });
  };
  
  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleRecalculate}
      >
        <RefreshCw className="h-4 w-4" />
        Recalcular previsão
      </Button>
    </div>
  );
}
