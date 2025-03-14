import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Convocation, Candidate } from '@/types';
import { addConvocation, updateConvocation, getCandidates, updateCandidateStatus } from '@/utils/storage';

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
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [hasCandidates, setHasCandidates] = useState(false);
  
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

  const handleAddCandidate = () => {
    if (!selectedCandidate) return;
    
    const currentCandidates = form.getValues('calledCandidates') || [];
    if (!currentCandidates.includes(selectedCandidate)) {
      form.setValue('calledCandidates', [...currentCandidates, selectedCandidate]);
    }
    setSelectedCandidate('');
  };

  const handleRemoveCandidate = (candidateId: string) => {
    const currentCandidates = form.getValues('calledCandidates') || [];
    form.setValue(
      'calledCandidates', 
      currentCandidates.filter(id => id !== candidateId)
    );
  };

  const getCandidateName = (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    return candidate ? candidate.name : 'Candidato não encontrado';
  };

  // Get only classified candidates that can be called
  const eligibleCandidates = candidates.filter(c => c.status === 'classified');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da convocação</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal justify-start",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
              
              <div className="flex gap-2">
                <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um candidato" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleCandidates.length > 0 ? (
                      eligibleCandidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name} (Pos. {candidate.position})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Não há candidatos classificados disponíveis
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={handleAddCandidate}
                  disabled={!selectedCandidate}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {!hasCandidates && (
                <p className="text-sm text-muted-foreground">
                  Não há candidatos classificados para convocar. Adicione candidatos primeiro.
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {watchCalledCandidates.length > 0 ? (
                  watchCalledCandidates.map((candidateId) => (
                    <Badge key={candidateId} variant="secondary" className="pr-1">
                      {getCandidateName(candidateId)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => handleRemoveCandidate(candidateId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum candidato selecionado
                  </p>
                )}
              </div>
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
