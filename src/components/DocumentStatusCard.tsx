
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileCheck, FileWarning, Files } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDocuments } from '@/utils/storage';
import { Badge } from '@/components/ui/badge';

export function DocumentStatusCard() {
  const { documentStatus } = useDocuments();
  
  // Get status indicator
  const getStatusIndicator = () => {
    if (documentStatus.expired > 0) {
      return {
        icon: <FileWarning className="h-5 w-5 text-amber-500" />,
        message: "Você tem documentos vencidos que precisam ser atualizados.",
        color: "text-amber-600",
        bgColor: "bg-amber-50"
      };
    }
    
    if (documentStatus.missing > 0) {
      return {
        icon: <Files className="h-5 w-5 text-blue-500" />,
        message: "Você ainda precisa providenciar alguns documentos.",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    }
    
    if (documentStatus.percentage === 100) {
      return {
        icon: <FileCheck className="h-5 w-5 text-green-500" />,
        message: "Todos os documentos estão completos e válidos!",
        color: "text-green-600",
        bgColor: "bg-green-50"
      };
    }
    
    return {
      icon: <Files className="h-5 w-5 text-gray-500" />,
      message: "Organize seus documentos para a convocação.",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    };
  };
  
  const status = getStatusIndicator();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Status dos Documentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <span className="font-medium">Documentos Prontos</span>
          </div>
          <div>
            <span className="font-bold">{documentStatus.completed}</span>
            <span className="text-muted-foreground">/{documentStatus.total}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso</span>
            <span>{documentStatus.percentage}%</span>
          </div>
          <Progress value={documentStatus.percentage} className="h-2" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {documentStatus.missing > 0 && (
            <Badge variant="outline" className="gap-1">
              <Files className="h-3.5 w-3.5" />
              <span>{documentStatus.missing} faltando</span>
            </Badge>
          )}
          
          {documentStatus.expired > 0 && (
            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100">
              <FileWarning className="h-3.5 w-3.5" />
              <span>{documentStatus.expired} vencidos</span>
            </Badge>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${status.bgColor} flex gap-2 items-start`}>
          {status.icon}
          <p className={`text-sm ${status.color}`}>{status.message}</p>
        </div>
        
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/documents">Gerenciar Documentos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
