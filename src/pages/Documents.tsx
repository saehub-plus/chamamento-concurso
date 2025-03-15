
import React from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { useDocuments } from '@/utils/storage';
import { File, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { staggerContainer, fadeIn } from '@/utils/animations';

export default function Documents() {
  const { documents, updateDocument } = useDocuments();
  
  // Calcular status dos documentos
  const completedDocuments = documents.filter(doc => doc.hasDocument && doc.isValid).length;
  const totalDocuments = documents.length;
  const completionPercentage = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;
  
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
          <motion.div variants={fadeIn()} className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
              <p className="text-muted-foreground">
                Gerencie seus documentos para o concurso
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center gap-1">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="font-medium">{completedDocuments}/{totalDocuments}</span>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">{completionPercentage.toFixed(0)}%</span>
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
      </main>
    </div>
  );
}
