
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { DocumentCard } from '@/components/DocumentCard';
import { useDocuments } from '@/utils/storage';
import { File, FileCheck, FileWarning, AlertTriangle, Syringe } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { staggerContainer, fadeIn } from '@/utils/animations';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isDocumentExpired, isDocumentComplete, hasVaccineProblem } from '@/utils/storage';

export default function Documents() {
  const { documents, updateDocument, documentStatus } = useDocuments();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  // Count documents in each category for tab badges
  const pendingCount = documents.filter(doc => 
    !doc.hasDocument || 
    (doc.hasDocument && !isDocumentComplete(doc) && !isDocumentExpired(doc) && !hasVaccineProblem(doc))
  ).length;
  
  const completedCount = documents.filter(doc => isDocumentComplete(doc)).length;
  const expiredCount = documents.filter(doc => doc.hasDocument && doc.expirationDate && isDocumentExpired(doc)).length;
  const vaccineProblemCount = documents.filter(doc => hasVaccineProblem(doc)).length;
  
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
              
              {documentStatus.vaccineProblem > 0 && (
                <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-600 hover:bg-orange-100">
                  <Syringe className="h-4 w-4" />
                  <span>{documentStatus.vaccineProblem} problemas com vacinas</span>
                </Badge>
              )}
            </div>
          </motion.div>

          {documents.length === 0 ? (
            <EmptyState
              icon={<File className="h-10 w-10" />}
              title="Nenhum documento cadastrado"
              description="Adicione documentos para gerenciar seus itens para o concurso."
            />
          ) : (
            <motion.div variants={fadeIn()}>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="all" className="relative">
                    Todos
                    <Badge className="ml-2">{documents.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="relative">
                    Pendentes
                    <Badge variant="outline" className="ml-2">{pendingCount}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="relative">
                    Concluídos
                    <Badge variant="outline" className="ml-2">{completedCount}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="expired" className="relative">
                    Vencidos
                    <Badge variant="destructive" className="ml-2">{expiredCount}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="vaccine" className="relative">
                    Vacinas
                    <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800">{vaccineProblemCount}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((document) => (
                      <DocumentCard 
                        key={document.id} 
                        document={document} 
                        onUpdate={updateDocument}
                        activeTab={activeTab}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="pending" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => !doc.hasDocument || (doc.hasDocument && !isDocumentComplete(doc) && !isDocumentExpired(doc) && !hasVaccineProblem(doc)))
                      .map((document) => (
                        <DocumentCard 
                          key={document.id} 
                          document={document} 
                          onUpdate={updateDocument}
                          activeTab={activeTab}
                        />
                      ))
                    }
                    {pendingCount === 0 && (
                      <div className="col-span-3 py-10 text-center">
                        <div className="flex flex-col items-center">
                          <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                          <h3 className="font-medium text-lg">Sem documentos pendentes</h3>
                          <p className="text-muted-foreground">Todos os seus documentos estão completos, vencidos ou com problemas de vacinas.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="completed" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => isDocumentComplete(doc))
                      .map((document) => (
                        <DocumentCard 
                          key={document.id} 
                          document={document} 
                          onUpdate={updateDocument}
                          activeTab={activeTab}
                        />
                      ))
                    }
                    {completedCount === 0 && (
                      <div className="col-span-3 py-10 text-center">
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
                          <h3 className="font-medium text-lg">Nenhum documento completo</h3>
                          <p className="text-muted-foreground">Complete seus documentos para vê-los aqui.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="expired" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => doc.hasDocument && doc.expirationDate && isDocumentExpired(doc))
                      .map((document) => (
                        <DocumentCard 
                          key={document.id} 
                          document={document} 
                          onUpdate={updateDocument}
                          activeTab={activeTab}
                        />
                      ))
                    }
                    {expiredCount === 0 && (
                      <div className="col-span-3 py-10 text-center">
                        <div className="flex flex-col items-center">
                          <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                          <h3 className="font-medium text-lg">Sem documentos vencidos</h3>
                          <p className="text-muted-foreground">Nenhum dos seus documentos está vencido.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="vaccine" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => hasVaccineProblem(doc))
                      .map((document) => (
                        <DocumentCard 
                          key={document.id} 
                          document={document} 
                          onUpdate={updateDocument}
                          activeTab={activeTab}
                        />
                      ))
                    }
                    {vaccineProblemCount === 0 && (
                      <div className="col-span-3 py-10 text-center">
                        <div className="flex flex-col items-center">
                          <FileCheck className="h-10 w-10 text-green-500 mb-2" />
                          <h3 className="font-medium text-lg">Sem problemas com vacinas</h3>
                          <p className="text-muted-foreground">Todas as suas vacinas têm esquemas válidos e completos.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
