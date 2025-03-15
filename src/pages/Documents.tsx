
import React from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { useDocuments } from '@/utils/storage';
import { File, FileCheck, FileWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { staggerContainer, fadeIn } from '@/utils/animations';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Documents() {
  const { documents, updateDocument, documentStatus } = useDocuments();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 layout-container py-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={fadeIn()} className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
              <p className="text-muted-foreground">
                Gerencie seus documentos para o concurso
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4">
              <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-1">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{documentStatus.completed}/{documentStatus.total}</span>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${documentStatus.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{documentStatus.percentage}%</span>
              </div>
              
              {documentStatus.missing > 0 && (
                <Badge variant="outline" className="gap-1">
                  <File className="h-4 w-4" />
                  <span>{documentStatus.missing} documentos faltando</span>
                </Badge>
              )}
              
              {documentStatus.expired > 0 && (
                <Badge variant="outline" className="gap-1 bg-red-50 text-red-600 hover:bg-red-100">
                  <FileWarning className="h-4 w-4" />
                  <span>{documentStatus.expired} documentos vencidos</span>
                </Badge>
              )}
            </div>
          </motion.div>

          {documents.length === 0 ? (
            <EmptyState
              icon={File}
              title="Nenhum documento cadastrado"
              description="Adicione documentos para gerenciar seus itens para o concurso."
            />
          ) : (
            <motion.div 
              variants={fadeIn()}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {documents.map((document) => (
                <DocumentCard 
                  key={document.id} 
                  document={document} 
                  onUpdate={updateDocument}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/')}>
            Voltar para o Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
