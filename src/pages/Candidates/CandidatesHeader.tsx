
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter, UserPlus } from 'lucide-react';

interface CandidatesHeaderProps {
  onAddCandidate: () => void;
  onBulkUpdate: () => void;
}

export function CandidatesHeader({ onAddCandidate, onBulkUpdate }: CandidatesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todos os candidatos classificados no concurso
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onBulkUpdate} variant="outline">
          <ListFilter className="h-4 w-4 mr-2" />
          Atualizar em Massa
        </Button>
        <Button onClick={onAddCandidate}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Candidato
        </Button>
      </div>
    </div>
  );
}
