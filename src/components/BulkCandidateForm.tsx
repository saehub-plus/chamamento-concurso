
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
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { addMultipleCandidates } from '@/utils/storage';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  names: z.string().min(3, { message: 'Adicione pelo menos um nome' }),
  startPosition: z.coerce.number().int().min(1, { message: 'Posição inicial deve ser um número maior que zero' }),
});

type FormValues = z.infer<typeof formSchema>;

interface BulkCandidateFormProps {
  onSuccess: (count: number) => void;
  onCancel: () => void;
}

export function BulkCandidateForm({ onSuccess, onCancel }: BulkCandidateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: '',
      startPosition: 1,
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    // Process the names
    const namesArray = values.names
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    // Manually assign positions starting from the specified position
    const candidates = namesArray.map((name, index) => ({
      name,
      position: values.startPosition + index,
      status: 'classified' as const
    }));
    
    // Add the candidates
    setTimeout(() => {
      try {
        addMultipleCandidates(namesArray);
        onSuccess(namesArray.length);
      } catch (error) {
        console.error('Error adding candidates:', error);
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="startPosition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posição inicial</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormDescription>
                A posição inicial na classificação do primeiro candidato da lista
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomes dos candidatos</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Cole a lista de nomes aqui, um por linha" 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Cole a lista de nomes, um por linha. Eles serão adicionados em ordem, começando da posição inicial especificada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar em massa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
