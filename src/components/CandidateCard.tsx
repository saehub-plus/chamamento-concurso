
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from './StatusBadge';
import { Candidate } from '@/types';
import { CandidateForm } from './CandidateForm';
import { 
  updateCandidateStatus, 
  removeCandidate
} from '@/utils/storage/candidateStorage';
import { toast } from 'sonner';
import { fadeVariants } from '@/utils/animations';
import { CandidateActions } from './candidate/CandidateActions';

interface CandidateCardProps {
  candidate: Candidate;
  onUpdate: () => void;
}

export function CandidateCard({ candidate, onUpdate }: CandidateCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleStatusChange = (status: Candidate['status']) => {
    updateCandidateStatus(candidate.id, status);
    onUpdate();
    toast.success(`Status alterado para ${getStatusLabel(status)}`);
  };
  
  const handleDelete = () => {
    removeCandidate(candidate.id);
    setShowDeleteDialog(false);
    onUpdate();
    toast.success('Candidato removido com sucesso');
  };
  
  const getStatusLabel = (status: Candidate['status']): string => {
    switch (status) {
      case 'classified': return 'Classificado';
      case 'called': return 'Convocado';
      case 'withdrawn': return 'Desistente';
      case 'eliminated': return 'Eliminado';
      case 'appointed': return 'Nomeado';
    }
  };
  
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card className={`overflow-hidden ${candidate.isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <StatusBadge status={candidate.status} />
            <div className="font-medium">#{candidate.position}</div>
          </div>
          
          <CandidateActions 
            candidate={candidate}
            onUpdate={onUpdate}
            onEditClick={() => setShowEditDialog(true)}
            onDeleteClick={() => setShowDeleteDialog(true)}
            onStatusChange={handleStatusChange}
          />
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          <h3 className="font-semibold truncate" title={candidate.name}>
            {candidate.name}
            {candidate.isCurrentUser && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                Você
              </span>
            )}
          </h3>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          Atualizado em {new Date(candidate.updatedAt).toLocaleDateString()}
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Candidato</DialogTitle>
            <DialogDescription>
              Atualize as informações do candidato abaixo.
            </DialogDescription>
          </DialogHeader>
          <CandidateForm
            initialData={candidate}
            onSuccess={() => {
              setShowEditDialog(false);
              onUpdate();
              toast.success('Candidato atualizado com sucesso');
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
