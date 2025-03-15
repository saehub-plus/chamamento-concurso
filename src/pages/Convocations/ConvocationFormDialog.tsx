
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ConvocationForm } from '@/components/ConvocationForm';
import { toast } from 'sonner';

interface ConvocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConvocationFormDialog({ open, onOpenChange, onSuccess }: ConvocationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Convocação</DialogTitle>
          <DialogDescription>
            Preencha as informações da convocação abaixo.
          </DialogDescription>
        </DialogHeader>
        <ConvocationForm
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
            toast.success('Convocação registrada com sucesso');
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
