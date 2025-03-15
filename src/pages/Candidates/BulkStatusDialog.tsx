
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BulkStatusForm } from '@/components/candidate/BulkStatusForm';
import { CandidateStatus } from '@/types';

interface BulkStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStatus?: CandidateStatus;
  onSuccess: () => void;
}

export function BulkStatusDialog({ 
  open, 
  onOpenChange, 
  filterStatus, 
  onSuccess 
}: BulkStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Atualizar Status em Massa</DialogTitle>
          <DialogDescription>
            Selecione os candidatos e o novo status para atualização em massa.
          </DialogDescription>
        </DialogHeader>
        <BulkStatusForm
          filterStatus={filterStatus}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
