
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Document } from '@/types';
import { Checkbox } from './ui/checkbox';
import { Calendar as CalendarIcon, ExternalLink, FileCheck, FilePlus, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { isDocumentExpired } from '@/utils/storage';

interface DocumentCardProps {
  document: Document;
  onUpdate: (id: string, document: Partial<Document>) => void;
}

// Helper to get readable validity period
const getReadableValidityPeriod = (validityPeriod?: string): string => {
  switch (validityPeriod) {
    case '30days': return '30 dias';
    case '90days': return '90 dias';
    case '3months': return '3 meses';
    case '1year': return '1 ano';
    case '5years': return '5 anos';
    case '10years': return '10 anos';
    case 'none': 
    default:
      return 'Sem validade';
  }
};

// Brazilian states for council certifications
const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];

export function DocumentCard({ document, onUpdate }: DocumentCardProps) {
  const [issueDate, setIssueDate] = useState<Date | undefined>(
    document.issueDate ? parseISO(document.issueDate) : undefined
  );

  const handleIssueDateSelect = (date: Date | undefined) => {
    setIssueDate(date);
    if (date) {
      onUpdate(document.id, { issueDate: date.toISOString() });
    } else {
      onUpdate(document.id, { issueDate: undefined });
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(document.id, { driveLink: e.target.value });
  };

  const handleStateToggle = (state: string) => {
    const currentStates = document.states || [];
    const updatedStates = currentStates.includes(state)
      ? currentStates.filter(s => s !== state)
      : [...currentStates, state];
    
    onUpdate(document.id, { states: updatedStates });
  };

  // Check if the document is expired
  const expired = document.expirationDate && isDocumentExpired(document);

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      expired ? "border-red-300 bg-red-50" : 
      document.hasDocument && document.isValid ? "border-green-300 bg-green-50" : ""
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>{document.name}</span>
            {document.validityPeriod && document.validityPeriod !== 'none' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">
                      {getReadableValidityPeriod(document.validityPeriod)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Validade: {getReadableValidityPeriod(document.validityPeriod)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {document.hasDocument && document.isValid && <FileCheck className="h-5 w-5 text-green-600" />}
          {(!document.hasDocument || !document.isValid) && <FilePlus className="h-5 w-5 text-gray-400" />}
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
        
        {document.validityPeriod && document.validityPeriod !== 'none' && (
          <div className="space-y-2">
            <Label htmlFor={`issue-date-${document.id}`}>
              Data de emissão {document.validityPeriod ? `(Validade: ${getReadableValidityPeriod(document.validityPeriod)})` : ''}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !issueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {issueDate ? format(issueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={handleIssueDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* State selection for council certifications */}
        {document.name === "Certidão Negativa Ético-Disciplinar do Conselho" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Selecione os estados onde possui registro:</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selecione todos os estados onde você possui registro profissional.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
              {brazilianStates.map((state) => (
                <Badge
                  key={state}
                  variant={document.states?.includes(state) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:opacity-80 transition-opacity",
                    document.states?.includes(state) ? "bg-primary" : ""
                  )}
                  onClick={() => handleStateToggle(state)}
                >
                  {state}
                </Badge>
              ))}
            </div>
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
          <div className={cn("text-sm", expired ? "text-red-500" : "text-green-600")}>
            {expired 
              ? `Expirou em ${format(parseISO(document.expirationDate), "dd/MM/yyyy")}`
              : `Válido até ${format(parseISO(document.expirationDate), "dd/MM/yyyy")}`
            }
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
