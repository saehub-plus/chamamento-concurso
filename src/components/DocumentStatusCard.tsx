
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileCheck, FileWarning, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentsStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DocumentStatusCardProps {
  status: DocumentsStatus;
}

export function DocumentStatusCard({ status }: DocumentStatusCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Status dos Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              <span>Completos:</span>
              <span className="font-medium">{status.completed}/{status.total}</span>
            </div>
            <div>
              <span className="text-sm font-medium">{status.percentage}%</span>
            </div>
          </div>
          
          <Progress value={status.percentage} className="h-2" />
          
          <div className="flex flex-col gap-2 mt-4">
            {status.missing > 0 && (
              <Badge variant="outline" className="gap-1 justify-start">
                <File className="h-4 w-4" />
                <span>{status.missing} documentos faltando</span>
              </Badge>
            )}
            
            {status.expired > 0 && (
              <Badge variant="outline" className="gap-1 justify-start bg-red-50 text-red-600 hover:bg-red-100">
                <FileWarning className="h-4 w-4" />
                <span>{status.expired} documentos vencidos</span>
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            size="sm"
            onClick={() => navigate('/documents')}
          >
            Gerenciar Documentos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
