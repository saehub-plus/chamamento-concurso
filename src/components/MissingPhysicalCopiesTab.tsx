
import React from 'react';
import { getDocuments, updateDocument } from '@/utils/storage/documentStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Document } from '@/types';

export function MissingPhysicalCopiesTab() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  
  React.useEffect(() => {
    // Get documents that are missing physical copies
    const allDocs = getDocuments();
    const docsWithoutPhysical = allDocs.filter(doc => 
      doc.hasDocument && !doc.hasPhysicalCopy
    );
    setDocuments(docsWithoutPhysical);
  }, []);
  
  const handlePhysicalCopyChange = (id: string, checked: boolean) => {
    const updatedDoc = updateDocument(id, { hasPhysicalCopy: checked });
    
    if (updatedDoc) {
      // Update local state
      setDocuments(prev => 
        checked 
          ? prev.filter(doc => doc.id !== id)  // Remove from list if checked
          : prev
      );
      
      // Show toast notification
      toast({
        title: checked ? "Cópia física registrada" : "Cópia física removida",
        description: `${updatedDoc.name} ${checked ? 'agora tem' : 'não tem mais'} cópia física.`
      });
    }
  };
  
  if (documents.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-medium text-muted-foreground mb-2">Nenhum documento pendente</h3>
        <p className="text-sm text-muted-foreground">
          Todos os seus documentos já possuem cópias físicas ou ainda não foram registrados.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Documentos sem Cópia Física</h2>
        <span className="text-sm text-muted-foreground">
          {documents.length} documento(s) pendente(s)
        </span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map(doc => (
          <Card key={doc.id} className="overflow-hidden border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{doc.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id={`physical-copy-${doc.id}`}
                  checked={doc.hasPhysicalCopy}
                  onCheckedChange={(checked) => handlePhysicalCopyChange(doc.id, !!checked)}
                />
                <label 
                  htmlFor={`physical-copy-${doc.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Recebi cópia física
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
