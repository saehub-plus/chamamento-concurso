
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, UserPlus, CalendarPlus } from 'lucide-react';
import { Header } from '@/components/Header';
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
import { ConvocationForm } from '@/components/ConvocationForm';
import { EmptyState } from '@/components/EmptyState';
import { getCandidates, getConvocations, getCandidateStatusCounts } from '@/utils/storage';
import { StatusCount, Candidate, Convocation } from '@/types';
import { toast } from 'sonner';
import { pageVariants } from '@/utils/animations';

export default function Index() {
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
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

  useEffect(() => {
    const loadData = () => {
      const candidates = getCandidates();
      const convocations = getConvocations();
      const counts = getCandidateStatusCounts();
      
      setStatusCounts(counts);
      setTotalCandidates(candidates.length);
      setTotalConvocations(convocations.length);
      setHasData(candidates.length > 0 || convocations.length > 0);
    };
    
    loadData();
  }, [shouldRefresh]);

  const handleRefresh = () => {
    setShouldRefresh(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
              Acompanhamento de convocações para enfermeiros em Joinville
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCandidateDialog(true)}
              size="sm"
              className="h-9"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Candidato
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
              <div className="flex gap-3">
                <Button onClick={() => setShowCandidateDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Candidato
                </Button>
                <Button variant="outline" onClick={() => setShowConvocationDialog(true)}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Registrar Convocação
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <StatisticsCard statusCounts={statusCounts} total={totalCandidates} />
            </div>
            
            <div className="space-y-6">
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
                      <Link to="/candidates">Ver todos</Link>
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
                      <Link to="/convocations">Ver todas</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
