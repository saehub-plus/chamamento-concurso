
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, FileWarning, Calendar, FileX } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Document } from '@/types';
import { getDocumentsWithProblems, getDocumentsExpiringBeforeDate } from '@/utils/storage/documentStorage';

interface DocumentWarningsAlertProps {
  predictedDate: Date | null;
}

export function DocumentWarningsAlert({ predictedDate }: DocumentWarningsAlertProps) {
  const [criticalDocuments, setCriticalDocuments] = useState<Document[]>([]);
  const [expiringDocuments, setExpiringDocuments] = useState<Document[]>([]);
  
  useEffect(() => {
    if (!predictedDate) return;
    
    // Refresh document problems
    setCriticalDocuments(getDocumentsWithProblems());
    setExpiringDocuments(getDocumentsExpiringBeforeDate(predictedDate, 15));
    
    // Setup interval to refresh the document problems
    const intervalId = setInterval(() => {
      setCriticalDocuments(getDocumentsWithProblems());
      setExpiringDocuments(getDocumentsExpiringBeforeDate(predictedDate, 15));
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [predictedDate]);
  
  if (!predictedDate) return null;
  
  if (criticalDocuments.length === 0 && expiringDocuments.length === 0) {
    return null;
  }
  
  const formattedDate = format(predictedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  return (
    <div className="space-y-4 my-4">
      {criticalDocuments.length > 0 && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-700 font-semibold mb-2">
            Documentos com problemas críticos!
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="mb-2">
              Você tem <strong>{criticalDocuments.length} documentos</strong> com problemas que podem 
              impedir seu processo de convocação. Resolva esses problemas o quanto antes para evitar 
              possível eliminação do concurso.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {criticalDocuments.slice(0, 3).map(doc => (
                <li key={doc.id}>
                  <strong>{doc.name}</strong>: {!doc.hasDocument ? 'Faltando' : 
                    doc.expirationDate && new Date(doc.expirationDate) < new Date() ? 'Vencido' : 
                    doc.name.includes('Vacina') ? 'Esquema vacinal incompleto/inadequado' : 
                    'Incompleto'}
                </li>
              ))}
              {criticalDocuments.length > 3 && (
                <li>E mais {criticalDocuments.length - 3} outros documentos...</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {expiringDocuments.length > 0 && (
        <Alert className="border-amber-300 bg-amber-50">
          <Calendar className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-700 font-semibold mb-2">
            Documentos que expirarão antes ou logo após sua convocação!
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              Com base na sua previsão de chamamento para <strong>{formattedDate}</strong>, os 
              seguintes documentos expirarão antes ou até 15 dias após essa data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {expiringDocuments.slice(0, 3).map(doc => (
                <li key={doc.id}>
                  <strong>{doc.name}</strong>: Expira em {
                    doc.expirationDate ? format(new Date(doc.expirationDate), "dd/MM/yyyy") : 'data desconhecida'
                  }
                </li>
              ))}
              {expiringDocuments.length > 3 && (
                <li>E mais {expiringDocuments.length - 3} outros documentos...</li>
              )}
            </ul>
            <p className="mt-2 text-sm">
              Lembre-se que o edital exige que os documentos estejam válidos no momento da convocação
              e nas 48h úteis para apresentação. Providencie a renovação com antecedência.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
