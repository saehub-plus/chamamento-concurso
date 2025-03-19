
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '@/components/ui/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentsStatus } from '@/types';
import { getDocuments, getDocumentsStatus } from '@/utils/storage/documentStorage';
import { CircleCheck, File, ListChecks, Clock, Workflow, AlertTriangle } from 'lucide-react';

export function DocumentsSection() {
  const navigate = useNavigate();
  const documentStatus = getDocumentsStatus();
  const allDocuments = getDocuments();
  
  // Calculate expiring documents
  const expiringDocuments = allDocuments.filter(doc => 
    doc.hasDocument && 
    doc.expirationDate && 
    new Date(doc.expirationDate) > new Date() &&
    new Date(doc.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Status dos Documentos
          </CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{documentStatus.percentage}%</div>
          <p className="text-xs text-muted-foreground">
            {documentStatus.completed} de {documentStatus.total} documentos completos
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/documents')}>
            <File className="mr-2 h-4 w-4" />
            Ver Documentos
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Documentos Expirando
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expiringDocuments.length}</div>
          <p className="text-xs text-muted-foreground">
            Documentos expirando nos próximos 30 dias
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/documents?filter=expiring')}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Ver Expiração
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cópias Físicas
          </CardTitle>
          <CircleCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {allDocuments.filter(doc => doc.hasDocument && doc.hasPhysicalCopy).length}
          </div>
          <p className="text-xs text-muted-foreground">
            {allDocuments.filter(doc => doc.hasDocument && !doc.hasPhysicalCopy).length} cópias físicas pendentes
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/documents?tab=physical')}>
            <Workflow className="mr-2 h-4 w-4" />
            Ver Cópias Físicas
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
