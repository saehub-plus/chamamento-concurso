
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CandidateForm } from '@/components/CandidateForm';
import { toast } from 'sonner';

interface CandidateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CandidateFormDialog({ open, onOpenChange, onSuccess }: CandidateFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Candidato</DialogTitle>
          <DialogDescription>
            Preencha as informações do candidato abaixo.
          </DialogDescription>
        </DialogHeader>
        <CandidateForm
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
            toast.success('Candidato adicionado com sucesso');
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
