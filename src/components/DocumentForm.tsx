
import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Document } from '@/types';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres'),
  hasExpiration: z.boolean().default(false),
  validityPeriod: z.string().optional(),
  needsNotarized: z.boolean().default(false),
  needsPhysicalCopy: z.boolean().default(false)
});

type DocumentFormData = z.infer<typeof formSchema>;

interface DocumentFormProps {
  onSuccess: (document: Document) => void;
  onCancel: () => void;
}

export function DocumentForm({ onSuccess, onCancel }: DocumentFormProps) {
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hasExpiration: false,
      validityPeriod: 'none',
      needsNotarized: false,
      needsPhysicalCopy: false
    }
  });

  const hasExpiration = form.watch('hasExpiration');

  const onSubmit = (data: DocumentFormData) => {
    try {
      const now = new Date().toISOString();
      const newDocument: Document = {
        id: crypto.randomUUID(),
        name: data.name,
        hasDocument: false,
        hasPhysicalCopy: false,
        isValid: true,
        validityPeriod: data.hasExpiration ? (data.validityPeriod as any) : 'none',
        hasNotarizedCopy: data.needsNotarized,
        createdAt: now,
        updatedAt: now
      };
      
      onSuccess(newDocument);
      toast({
        title: "Documento cadastrado",
        description: `${data.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao cadastrar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o documento.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do documento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Carteira de Identidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hasExpiration"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Tem validade</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Marque se o documento precisa ser renovado periodicamente
                </p>
              </div>
            </FormItem>
          )}
        />
        
        {hasExpiration && (
          <FormField
            control={form.control}
            name="validityPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período de validade</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período de validade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sem validade</SelectItem>
                    <SelectItem value="30days">30 dias</SelectItem>
                    <SelectItem value="90days">90 dias</SelectItem>
                    <SelectItem value="3months">3 meses</SelectItem>
                    <SelectItem value="1year">1 ano</SelectItem>
                    <SelectItem value="5years">5 anos</SelectItem>
                    <SelectItem value="10years">10 anos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="needsNotarized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Precisa de firma reconhecida</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Marque se o documento precisa ter firma reconhecida em cartório
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="needsPhysicalCopy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Precisa de cópia física</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Marque se o documento precisa ser entregue fisicamente
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <Calendar className="mr-2 h-4 w-4" />
            Cadastrar Documento
          </Button>
        </div>
      </form>
    </Form>
  );
}
