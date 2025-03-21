
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, UserPlus, CalendarPlus, ListPlus } from 'lucide-react';
import { HeaderWrapper } from '@/components/HeaderWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StatisticsCard } from '@/components/StatisticsCard';
import { CandidateForm } from '@/components/CandidateForm';
import { BulkCandidateForm } from '@/components/BulkCandidateForm';
import { ConvocationForm } from '@/components/ConvocationForm';
import { PredictionCardEnhanced } from '@/components/PredictionCardEnhanced';
import { ArimaPrediction } from '@/components/prediction/ArimaPrediction';
import { DocumentStatusCard } from '@/components/DocumentStatusCard';
import { EmptyState } from '@/components/EmptyState';
import { CallsOverTimeChart } from '@/components/charts/CallsOverTimeChart';
import { getCandidates, getConvocations, getCandidateStatusCounts, getDocumentsStatus, predictCandidateCall } from '@/utils/storage';
import { StatusCount, Candidate, Convocation, DocumentsStatus } from '@/types';
import { toast } from 'sonner';
import { pageVariants } from '@/utils/animations';
import { useCompetition } from '@/context/CompetitionContext';

export default function Index() {
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showBulkCandidateDialog, setShowBulkCandidateDialog] = useState(false);
  const [showConvocationDialog, setShowConvocationDialog] = useState(false);
  const [statusCounts, setStatusCounts] = useState<StatusCount>({
    classified: 0,
    called: 0,
    withdrawn: 0,
    eliminated: 0,
    appointed: 0
  });
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalConvocations, setTotalConvocations] = useState(0);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<DocumentsStatus>({
    total: 0,
    completed: 0,
    expired: 0,
    missing: 0,
    vaccineProblem: 0,
    percentage: 0
  });
  const [currentUserPosition, setCurrentUserPosition] = useState<number>(0);
  const { currentCompetition, getCompetitionLogo } = useCompetition();

  useEffect(() => {
    const loadData = () => {
      const candidates = getCandidates();
      const convocations = getConvocations();
      const counts = getCandidateStatusCounts();
      const docStatus = getDocumentsStatus();
      
      setStatusCounts(counts);
      setTotalCandidates(candidates.length);
      setTotalConvocations(convocations.length);
      setHasData(candidates.length > 0 || convocations.length > 0);
      setDocumentStatus(docStatus);
      
      // Set current user position for prediction
      const currentUser = candidates.find(c => c.isCurrentUser);
      if (currentUser) {
        setCurrentUserPosition(currentUser.position);
      } else if (candidates.length > 0) {
        setCurrentUserPosition(candidates[0].position);
      }
    };
    
    loadData();
  }, [shouldRefresh]);

  const handleRefresh = () => {
    setShouldRefresh(prev => !prev);
  };

  // Get prediction data for ARIMA component
  const candidatePrediction = currentUserPosition ? predictCandidateCall(currentUserPosition) : null;

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="layout-container py-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhamento de convocações para enfermeiros
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowCandidateDialog(true)}
              size="sm"
              className="h-9"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Candidato
            </Button>
            <Button 
              onClick={() => setShowBulkCandidateDialog(true)}
              size="sm"
              variant="outline"
              className="h-9"
            >
              <ListPlus className="h-4 w-4 mr-2" />
              Adicionar em Massa
            </Button>
            <Button 
              onClick={() => setShowConvocationDialog(true)}
              size="sm"
              className="h-9"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Nova Convocação
            </Button>
          </div>
        </div>
        
        {!hasData ? (
          <EmptyState
            title="Nenhum dado encontrado"
            description="Comece adicionando candidatos e registrando convocações para visualizar estatísticas aqui."
            icon={<Plus className="h-10 w-10 text-primary/60" />}
            action={
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => setShowCandidateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Candidato
                </Button>
                <Button variant="outline" onClick={() => setShowBulkCandidateDialog(true)}>
                  <ListPlus className="h-4 w-4 mr-2" />
                  Adicionar em Massa
                </Button>
                <Button variant="outline" onClick={() => setShowConvocationDialog(true)}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Registrar Convocação
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Competition selection buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/joinville">
                <Button 
                  variant={currentCompetition === "joinville" ? "default" : "outline"} 
                  className="w-full h-32 rounded-xl flex flex-col items-center justify-center p-4 transition-all"
                >
                  <img 
                    src="/lovable-uploads/2ffdbb6f-3cb5-4fa5-9565-5d87797f474f.png" 
                    alt="Joinville" 
                    className="h-16 w-auto mb-2" 
                  />
                  <span className="font-medium">Joinville</span>
                </Button>
              </Link>
              <Link to="/florianopolis-concurso">
                <Button 
                  variant={currentCompetition === "florianopolis-concurso" ? "default" : "outline"} 
                  className="w-full h-32 rounded-xl flex flex-col items-center justify-center p-4 transition-all"
                >
                  <img 
                    src="/lovable-uploads/78a6d346-e822-4a04-a632-c8a959dceac7.png" 
                    alt="Florianópolis Concurso" 
                    className="h-16 w-auto mb-2" 
                  />
                  <span className="font-medium">Florianópolis - Concurso</span>
                </Button>
              </Link>
              <Link to="/florianopolis-processo">
                <Button 
                  variant={currentCompetition === "florianopolis-processo" ? "default" : "outline"} 
                  className="w-full h-32 rounded-xl flex flex-col items-center justify-center p-4 transition-all"
                >
                  <img 
                    src="/lovable-uploads/78a6d346-e822-4a04-a632-c8a959dceac7.png" 
                    alt="Florianópolis Processo" 
                    className="h-16 w-auto mb-2" 
                  />
                  <span className="font-medium">Florianópolis - Processo</span>
                </Button>
              </Link>
            </div>
            
            {/* Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PredictionCardEnhanced />
              {candidatePrediction && (
                <ArimaPrediction 
                  position={currentUserPosition}
                  predictedDate={candidatePrediction.predictedDate}
                  confidence={candidatePrediction.confidence}
                />
              )}
            </div>
            
            {/* Calls Over Time Chart */}
            <CallsOverTimeChart />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <StatisticsCard statusCounts={statusCounts} total={totalCandidates} />
              </div>
              
              <div className="space-y-6">
                <DocumentStatusCard status={documentStatus} />
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Candidatos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalCandidates}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Candidatos registrados
                    </p>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to={`/${currentCompetition}/candidates`}>Ver todos</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Convocações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalConvocations}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Convocações registradas
                    </p>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to={`/${currentCompetition}/convocations`}>Ver todas</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </motion.main>
      
      {/* Add Candidate Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Candidato</DialogTitle>
            <DialogDescription>
              Preencha as informações do candidato abaixo.
            </DialogDescription>
          </DialogHeader>
          <CandidateForm
            onSuccess={() => {
              setShowCandidateDialog(false);
              handleRefresh();
              toast.success('Candidato adicionado com sucesso');
            }}
            onCancel={() => setShowCandidateDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Bulk Add Candidates Dialog */}
      <Dialog open={showBulkCandidateDialog} onOpenChange={setShowBulkCandidateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Candidatos em Massa</DialogTitle>
            <DialogDescription>
              Cole a lista de nomes, um por linha. Eles serão adicionados em ordem, começando da posição especificada.
            </DialogDescription>
          </DialogHeader>
          <BulkCandidateForm
            onSuccess={(count) => {
              setShowBulkCandidateDialog(false);
              handleRefresh();
              toast.success(`${count} candidatos adicionados com sucesso`);
            }}
            onCancel={() => setShowBulkCandidateDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Convocation Dialog */}
      <Dialog open={showConvocationDialog} onOpenChange={setShowConvocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Convocação</DialogTitle>
            <DialogDescription>
              Preencha as informações da convocação abaixo.
            </DialogDescription>
          </DialogHeader>
          <ConvocationForm
            onSuccess={() => {
              setShowConvocationDialog(false);
              handleRefresh();
              toast.success('Convocação registrada com sucesso');
            }}
            onCancel={() => setShowConvocationDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
