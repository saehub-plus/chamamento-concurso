
import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MoreVertical, Edit, Trash2, Users } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Convocation } from '@/types';
import { deleteConvocation, getCandidateById } from '@/utils/storage';
import { toast } from 'sonner';
import { ConvocationForm } from './ConvocationForm';
import { cardVariants } from '@/utils/animations';

interface ConvocationCardProps {
  convocation: Convocation;
  onUpdate: () => void;
}

export function ConvocationCard({ convocation, onUpdate }: ConvocationCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    
    setTimeout(() => {
      deleteConvocation(convocation.id);
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success('Convocação removida com sucesso');
      onUpdate();
    }, 500);
  };

  const formatConvocationDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
                <div className="rounded-full bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{formatConvocationDate(convocation.date)}</h3>
                  <p className="text-xs text-muted-foreground">
                    Registrado em {format(new Date(convocation.createdAt), "dd/MM/yyyy")}
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
              <Badge variant={convocation.hasCalled ? "default" : "outline"}>
                {convocation.hasCalled ? "Houve convocações" : "Sem convocações"}
              </Badge>
            </div>
              
            {convocation.hasCalled && convocation.calledCandidates.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-1 mb-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Candidatos convocados:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {convocation.calledCandidates.map((candidateId) => {
                    const candidate = getCandidateById(candidateId);
                    return (
                      <Badge key={candidateId} variant="secondary">
                        {candidate ? candidate.name : 'Candidato não encontrado'}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
              
            {convocation.notes && (
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="font-medium mb-1">Observações:</div>
                <p>{convocation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Convocação</DialogTitle>
            <DialogDescription>
              Atualize as informações da convocação abaixo.
            </DialogDescription>
          </DialogHeader>
          <ConvocationForm 
            initialData={convocation}
            onSuccess={() => {
              setShowEditDialog(false);
              onUpdate();
              toast.success('Convocação atualizada com sucesso');
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Convocação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta convocação? Esta ação não pode ser desfeita.
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
    </>
  );
}
