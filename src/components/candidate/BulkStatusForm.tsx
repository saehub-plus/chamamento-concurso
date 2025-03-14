
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Candidate } from '@/types';
import { StatusBadge } from '../StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCandidates, bulkUpdateCandidateStatus } from '@/utils/storage';
import { toast } from 'sonner';

const formSchema = z.object({
  status: z.enum(['classified', 'called', 'withdrawn', 'eliminated', 'appointed']),
  candidateIds: z.array(z.string()).min(1, "Selecione pelo menos um candidato")
});

type FormValues = z.infer<typeof formSchema>;

interface BulkStatusFormProps {
  filterStatus?: Candidate['status'];
  onSuccess: () => void;
  onCancel: () => void;
}

export function BulkStatusForm({ filterStatus = 'classified', onSuccess, onCancel }: BulkStatusFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'called',
      candidateIds: []
    }
  });

  useEffect(() => {
    const allCandidates = getCandidates();
    let filteredCandidates = allCandidates;
    
    if (filterStatus) {
      filteredCandidates = allCandidates.filter(c => c.status === filterStatus);
    }
    
    // Sort by position
    filteredCandidates.sort((a, b) => a.position - b.position);
    
    setCandidates(filteredCandidates);
  }, [filterStatus]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const updatedCount = bulkUpdateCandidateStatus(values.candidateIds, values.status);
      
      toast.success(`Status de ${updatedCount} candidato(s) atualizado para ${getStatusLabel(values.status)}`);
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      toast.error('Erro ao atualizar os candidatos');
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    form.setValue('candidateIds', candidates.map(c => c.id));
  };

  const handleDeselectAll = () => {
    form.setValue('candidateIds', []);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Novo Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="classified">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="classified" size="sm" />
                      <span>Classificado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="called">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="called" size="sm" />
                      <span>Convocado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="withdrawn">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="withdrawn" size="sm" />
                      <span>Desistente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="eliminated">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="eliminated" size="sm" />
                      <span>Eliminado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="appointed">
                    <div className="flex items-center gap-2">
                      <StatusBadge status="appointed" size="sm" />
                      <span>Nomeado</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <div className="flex justify-between mb-2">
            <FormLabel>Selecione os candidatos classificados</FormLabel>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                Selecionar todos
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
                Limpar seleção
              </Button>
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-4">
            <FormField
              control={form.control}
              name="candidateIds"
              render={() => (
                <div className="space-y-2">
                  {candidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum candidato classificado encontrado
                    </p>
                  ) : (
                    candidates.map((candidate) => (
                      <FormField
                        key={candidate.id}
                        control={form.control}
                        name="candidateIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(candidate.id)}
                                  onCheckedChange={(checked) => {
                                    const current = [...(field.value || [])];
                                    if (checked) {
                                      if (!current.includes(candidate.id)) {
                                        field.onChange([...current, candidate.id]);
                                      }
                                    } else {
                                      field.onChange(
                                        current.filter((value) => value !== candidate.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="flex space-x-2 items-center">
                                <StatusBadge status={candidate.status} size="sm" />
                                <span className="text-sm font-medium">
                                  #{candidate.position} - {candidate.name}
                                </span>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            />
          </div>
          <FormMessage>{form.formState.errors.candidateIds?.message}</FormMessage>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Atualizar Status'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
