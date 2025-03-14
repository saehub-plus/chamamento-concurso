
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Candidate } from '@/types';

interface CandidateSelectorProps {
  candidates: Candidate[];
  selectedCandidates: string[];
  onCandidateSelect: (candidateId: string) => void;
  onCandidateRemove: (candidateId: string) => void;
}

export function CandidateSelector({
  candidates,
  selectedCandidates,
  onCandidateSelect,
  onCandidateRemove
}: CandidateSelectorProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  
  // Só mostrar candidatos classificados que ainda não foram selecionados
  const eligibleCandidates = candidates.filter(
    c => c.status === 'classified' && !selectedCandidates.includes(c.id)
  );

  const handleSelectCandidate = (candidateId: string) => {
    onCandidateSelect(candidateId);
    setSelectedCandidateId('');
  };
  
  const getCandidateName = (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    return candidate ? candidate.name : 'Candidato não encontrado';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select 
          value={selectedCandidateId} 
          onValueChange={(value) => {
            setSelectedCandidateId(value);
            handleSelectCandidate(value); // Adiciona candidato automaticamente ao selecionar
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione um candidato" />
          </SelectTrigger>
          <SelectContent>
            {eligibleCandidates.length > 0 ? (
              eligibleCandidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name} (Pos. {candidate.position})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Não há candidatos classificados disponíveis
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedCandidates.length > 0 ? (
          selectedCandidates.map((candidateId) => (
            <Badge key={candidateId} variant="secondary" className="pr-1">
              {getCandidateName(candidateId)}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => onCandidateRemove(candidateId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Nenhum candidato selecionado
          </p>
        )}
      </div>
    </div>
  );
}
