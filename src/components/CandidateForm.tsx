
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Candidate } from '@/types';
import { addCandidate, updateCandidate } from '@/utils/storage/candidateStorage';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  position: z.coerce.number().int().min(1, { message: 'Posição deve ser um número maior que zero' }),
  status: z.enum(['classified', 'called', 'withdrawn', 'eliminated', 'appointed'])
});

type FormValues = z.infer<typeof formSchema>;

interface CandidateFormProps {
  initialData?: Candidate;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CandidateForm({ initialData, onSuccess, onCancel }: CandidateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      position: initialData.position,
      status: initialData.status
    } : {
      name: '',
      position: 1,
      status: 'classified' as const
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (initialData) {
        updateCandidate(initialData.id, values);
      } else {
        // Create a new candidate with required fields
        const candidateData: Omit<Candidate, 'id'> = {
          name: values.name,
          position: values.position,
          status: values.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        addCandidate(candidateData);
      }
      
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do candidato" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posição na classificação</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
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
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
