
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BulkDateForm } from '@/components/convocation/BulkDateForm';

interface BulkDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkDatesDialog({ open, onOpenChange, onSuccess }: BulkDatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Datas em Massa</DialogTitle>
          <DialogDescription>
            Adicione várias datas sem convocações de uma vez.
          </DialogDescription>
        </DialogHeader>
        <BulkDateForm
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
