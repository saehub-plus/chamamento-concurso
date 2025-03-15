
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CalendarX } from 'lucide-react';

interface ConvocationsHeaderProps {
  onAddConvocation: () => void;
  onAddBulkDates: () => void;
}

export function ConvocationsHeader({ onAddConvocation, onAddBulkDates }: ConvocationsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Convocações</h1>
        <p className="text-muted-foreground mt-1">
          Registre e acompanhe as convocações realizadas
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddBulkDates} variant="outline">
          <CalendarX className="h-4 w-4 mr-2" />
          Datas em Massa
        </Button>
        <Button onClick={onAddConvocation}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          Nova Convocação
        </Button>
      </div>
    </div>
  );
}
