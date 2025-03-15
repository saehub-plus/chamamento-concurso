
import React, { useState } from 'react';
import { format, parseISO, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Document } from '@/types';
import { Checkbox } from './ui/checkbox';
import { Calendar as CalendarIcon, ExternalLink, FileCheck, FilePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  document: Document;
  onUpdate: (id: string, document: Partial<Document>) => void;
}

export function DocumentCard({ document, onUpdate }: DocumentCardProps) {
  const [date, setDate] = useState<Date | undefined>(
    document.expirationDate ? parseISO(document.expirationDate) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      onUpdate(document.id, { expirationDate: date.toISOString() });
    } else {
      onUpdate(document.id, { expirationDate: undefined });
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(document.id, { driveLink: e.target.value });
  };

  // Verificar se o documento expirou
  const isExpired = () => {
    if (!document.expirationDate) return false;
    
    const expiryDate = parseISO(document.expirationDate);
    return expiryDate < new Date();
  };

  // Obter a data de validade do Exame de Acuidade Visual (1 ano)
  const getDefaultExpiryDate = () => {
    if (document.name === "Exame de Acuidade Visual") {
      return addYears(new Date(), 1);
    }
    return undefined;
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      isExpired() ? "border-red-300 bg-red-50" : 
      document.hasDocument ? "border-green-300 bg-green-50" : ""
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>{document.name}</span>
          {document.hasDocument && <FileCheck className="h-5 w-5 text-green-600" />}
          {!document.hasDocument && <FilePlus className="h-5 w-5 text-gray-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`has-document-${document.id}`}
              checked={document.hasDocument}
              onCheckedChange={(checked) => {
                onUpdate(document.id, { hasDocument: !!checked });
              }}
            />
            <Label htmlFor={`has-document-${document.id}`}>Possuo o documento</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`has-physical-${document.id}`}
              checked={document.hasPhysicalCopy}
              onCheckedChange={(checked) => {
                onUpdate(document.id, { hasPhysicalCopy: !!checked });
              }}
            />
            <Label htmlFor={`has-physical-${document.id}`}>Tenho cópia física</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`is-valid-${document.id}`}
              checked={document.isValid}
              onCheckedChange={(checked) => {
                onUpdate(document.id, { isValid: !!checked });
              }}
            />
            <Label htmlFor={`is-valid-${document.id}`}>Documento válido</Label>
          </div>
        </div>
        
        {document.name === "Exame de Acuidade Visual" && (
          <div className="space-y-2">
            <Label htmlFor={`expiry-date-${document.id}`}>Data de validade (1 ano)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  defaultMonth={getDefaultExpiryDate()}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor={`link-${document.id}`}>Link no Google Drive</Label>
          <div className="flex items-center space-x-2">
            <Input
              id={`link-${document.id}`}
              type="url"
              placeholder="https://drive.google.com/..."
              value={document.driveLink || ""}
              onChange={handleLinkChange}
              className="flex-1"
            />
            {document.driveLink && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(document.driveLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        {document.expirationDate && (
          <div className={cn("text-sm", isExpired() ? "text-red-500" : "text-green-600")}>
            {isExpired() 
              ? `Expirou em ${format(parseISO(document.expirationDate), "dd/MM/yyyy")}`
              : `Válido até ${format(parseISO(document.expirationDate), "dd/MM/yyyy")}`
            }
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
