
import { useState } from 'react';
import { MoreVertical, Edit, Trash, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '../StatusBadge';
import { Candidate } from '@/types';
import { toast } from 'sonner';
import { markAsCurrentUser, clearCurrentUser } from '@/utils/storage/candidateStorage';

interface CandidateActionsProps {
  candidate: Candidate;
  onUpdate: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onStatusChange: (status: Candidate['status']) => void;
}

export function CandidateActions({ 
  candidate, 
  onUpdate, 
  onEditClick, 
  onDeleteClick, 
  onStatusChange 
}: CandidateActionsProps) {
  const handleMarkAsCurrentUser = () => {
    if (candidate.isCurrentUser) {
      clearCurrentUser();
      toast.success('Não é mais você');
    } else {
      markAsCurrentUser(candidate.id);
      toast.success('Marcado como você');
    }
    onUpdate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleMarkAsCurrentUser}>
          <User className="mr-2 h-4 w-4" />
          {candidate.isCurrentUser ? 'Não é você' : 'É você'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => onStatusChange('classified')}
          disabled={candidate.status === 'classified'}
        >
          <StatusBadge status="classified" size="sm" />
          <span className="ml-2">Classificado</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onStatusChange('called')}
          disabled={candidate.status === 'called'}
        >
          <StatusBadge status="called" size="sm" />
          <span className="ml-2">Convocado</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onStatusChange('appointed')}
          disabled={candidate.status === 'appointed'}
        >
          <StatusBadge status="appointed" size="sm" />
          <span className="ml-2">Nomeado</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onStatusChange('withdrawn')}
          disabled={candidate.status === 'withdrawn'}
        >
          <StatusBadge status="withdrawn" size="sm" />
          <span className="ml-2">Desistente</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onStatusChange('eliminated')}
          disabled={candidate.status === 'eliminated'}
        >
          <StatusBadge status="eliminated" size="sm" />
          <span className="ml-2">Eliminado</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
