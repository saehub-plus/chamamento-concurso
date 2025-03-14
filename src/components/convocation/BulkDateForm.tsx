
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, CalendarX } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addMultipleEmptyConvocations } from '@/utils/storage';
import { toast } from 'sonner';

const formSchema = z.object({
  dates: z.string().min(1, { message: 'Insira pelo menos uma data' })
});

type FormValues = z.infer<typeof formSchema>;

interface BulkDateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BulkDateForm({ onSuccess, onCancel }: BulkDateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dates: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Parse dates (DD/MM/YYYY format)
      const dateStrings = values.dates
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      const parsedDates: Date[] = [];
      const failedDates: string[] = [];
      
      for (const dateStr of dateStrings) {
        const trimmed = dateStr.trim();
        // Try to parse the date (DD/MM/YYYY)
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
          const [day, month, year] = trimmed.split('/').map(Number);
          const date = new Date(year, month - 1, day);
          
          if (!isNaN(date.getTime())) {
            parsedDates.push(date);
          } else {
            failedDates.push(trimmed);
          }
        } else {
          failedDates.push(trimmed);
        }
      }
      
      if (parsedDates.length === 0) {
        toast.error('Nenhuma data válida encontrada. Use o formato DD/MM/YYYY.');
        setIsSubmitting(false);
        return;
      }
      
      // Add convocations
      addMultipleEmptyConvocations(parsedDates);
      
      if (failedDates.length > 0) {
        toast.warning(`${failedDates.length} data(s) não pôde(ram) ser processada(s): ${failedDates.join(', ')}`);
      }
      
      toast.success(`${parsedDates.length} data(s) de convocação sem chamamentos adicionada(s)`);
      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      toast.error('Erro ao processar as datas');
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="dates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datas sem convocação</FormLabel>
              <FormDescription>
                Insira uma data por linha no formato DD/MM/YYYY
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="01/01/2023
02/01/2023
03/01/2023"
                  className="min-h-[150px]"
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
            {isSubmitting ? 'Salvando...' : 'Adicionar Datas'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
