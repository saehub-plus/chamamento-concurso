
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { CandidateForm } from './CandidateForm';
import { Candidate } from '@/types';
import { deleteCandidate, updateCandidateStatus } from '@/utils/storage';
import { toast } from 'sonner';
import { cardVariants } from '@/utils/animations';

interface CandidateCardProps {
  candidate: Candidate;
  onUpdate: () => void;
}

export function CandidateCard({ candidate, onUpdate }: CandidateCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    
    setTimeout(() => {
      deleteCandidate(candidate.id);
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success('Candidato removido com sucesso');
      onUpdate();
    }, 500);
  };

  const handleStatusChange = (status: Candidate['status']) => {
    updateCandidateStatus(candidate.id, status);
    setShowStatusDialog(false);
    toast.success('Status atualizado com sucesso');
    onUpdate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        <Card className="h-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xl font-medium w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  {candidate.position}
                </div>
                <div>
                  <h3 className="font-medium">{candidate.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Desde {formatDate(candidate.createdAt)}
                  </p>
                </div>
              </div>
                
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
                    Alterar status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
              
            <div className="mt-4">
              <StatusBadge status={candidate.status} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Candidato</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Selecione o novo status para o candidato {candidate.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {(['classified', 'called', 'withdrawn', 'eliminated', 'appointed'] as Candidate['status'][]).map((status) => (
              <Button
                key={status}
                variant={candidate.status === status ? "default" : "outline"}
                className="justify-start h-auto py-4"
                onClick={() => handleStatusChange(status)}
              >
                <StatusBadge status={status} className="mr-2" />
                <span>
                  {status === 'classified' && 'Classificado'}
                  {status === 'called' && 'Convocado'}
                  {status === 'withdrawn' && 'Desistente'}
                  {status === 'eliminated' && 'Eliminado'}
                  {status === 'appointed' && 'Nomeado'}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
