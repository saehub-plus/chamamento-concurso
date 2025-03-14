
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Convocation, Candidate } from '@/types';
import { addConvocation, updateConvocation, getCandidates, updateCandidateStatus } from '@/utils/storage';
import { CandidateSelector } from './convocation/CandidateSelector';
import { DateInput } from './convocation/DateInput';

const formSchema = z.object({
  date: z.date(),
  hasCalled: z.boolean(),
  calledCandidates: z.array(z.string()).optional(),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ConvocationFormProps {
  initialData?: Convocation;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConvocationForm({ initialData, onSuccess, onCancel }: ConvocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasCandidates, setHasCandidates] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      date: new Date(initialData.date),
      hasCalled: initialData.hasCalled,
      calledCandidates: initialData.calledCandidates,
      notes: initialData.notes || ''
    } : {
      date: new Date(),
      hasCalled: false,
      calledCandidates: [],
      notes: ''
    }
  });

  const watchHasCalled = form.watch('hasCalled');
  const watchCalledCandidates = form.watch('calledCandidates') || [];

  useEffect(() => {
    const allCandidates = getCandidates();
    setCandidates(allCandidates);
    // Only show eligible candidates - those who are classified
    setHasCandidates(allCandidates.filter(c => c.status === 'classified').length > 0);
  }, []);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Update any called candidates to status "called"
      if (values.hasCalled && values.calledCandidates?.length) {
        values.calledCandidates.forEach((candidateId) => {
          updateCandidateStatus(candidateId, 'called');
        });
      }
      
      // Ensure all required fields are present
      const convocationData: Omit<Convocation, 'id' | 'createdAt'> = {
        date: values.date.toISOString(),
        hasCalled: values.hasCalled,
        calledCandidates: values.calledCandidates || [],
        notes: values.notes
      };
      
      if (initialData) {
        updateConvocation(initialData.id, convocationData);
      } else {
        addConvocation(convocationData);
      }
      
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  const handleAddCandidate = (candidateId: string) => {
    if (!candidateId) return;
    
    const currentCandidates = form.getValues('calledCandidates') || [];
    if (!currentCandidates.includes(candidateId)) {
      form.setValue('calledCandidates', [...currentCandidates, candidateId]);
    }
  };

  const handleRemoveCandidate = (candidateId: string) => {
    const currentCandidates = form.getValues('calledCandidates') || [];
    form.setValue(
      'calledCandidates', 
      currentCandidates.filter(id => id !== candidateId)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da convocação</FormLabel>
              <FormControl>
                <DateInput
                  date={field.value}
                  onChange={field.onChange}
                  calendarOpen={calendarOpen}
                  setCalendarOpen={setCalendarOpen}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hasCalled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Houve convocados?</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {watchHasCalled && (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Candidatos convocados</label>
              
              <CandidateSelector
                candidates={candidates}
                selectedCandidates={watchCalledCandidates}
                onCandidateSelect={handleAddCandidate}
                onCandidateRemove={handleRemoveCandidate}
              />
              
              {!hasCandidates && (
                <p className="text-sm text-muted-foreground">
                  Não há candidatos classificados para convocar. Adicione candidatos primeiro.
                </p>
              )}
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione informações adicionais sobre esta convocação"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
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
