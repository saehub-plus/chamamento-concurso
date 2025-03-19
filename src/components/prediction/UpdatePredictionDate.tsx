
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { DateInput } from '@/components/convocation/DateInput';
import { toast } from '@/hooks/use-toast';

interface UpdatePredictionDateProps {
  onUpdateDate: (date: Date) => void;
  currentDate: Date;
}

export function UpdatePredictionDate({ onUpdateDate, currentDate }: UpdatePredictionDateProps) {
  const [date, setDate] = React.useState<Date>(currentDate);
  
  const handleUpdate = () => {
    onUpdateDate(date);
    toast({
      title: "Data atualizada",
      description: `A data de previsão foi atualizada para ${date.toLocaleDateString('pt-BR')}.`
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-end">
      <div className="flex-grow">
        <p className="text-sm mb-1 text-muted-foreground">Atualizar data de referência</p>
        <DateInput date={date} onChange={setDate} />
      </div>
      <Button size="sm" onClick={handleUpdate} className="flex items-center gap-1">
        <RefreshCw className="h-4 w-4" />
        <span>Atualizar</span>
      </Button>
    </div>
  );
}
