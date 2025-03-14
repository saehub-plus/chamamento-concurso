
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, UserPlus, Users, XCircle, ListFilter } from 'lucide-react';
import { getCandidates } from '@/utils/storage';
import { Candidate, CandidateStatus } from '@/types';
import { CandidateCard } from '@/components/CandidateCard';
import { CandidateForm } from '@/components/CandidateForm';
import { BulkStatusForm } from '@/components/candidate/BulkStatusForm';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { pageVariants, containerVariants } from '@/utils/animations';

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Load candidates from storage
  useEffect(() => {
    const loadData = () => {
      const data = getCandidates();
      setCandidates(data);
    };
    
    loadData();
  }, [shouldRefresh]);

  // Apply filters and search
  useEffect(() => {
    let result = [...candidates];
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      result = result.filter(candidate => candidate.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        candidate => candidate.name.toLowerCase().includes(query) || 
                    candidate.position.toString().includes(query)
      );
    }
    
    // Apply sort order
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.position - b.position;
      } else {
        return b.position - a.position;
      }
    });
    
    setFilteredCandidates(result);
  }, [candidates, statusFilter, searchQuery, sortOrder]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setStatusFilter('all');
    } else {
      setStatusFilter(value as CandidateStatus);
    }
  };

  const handleRefresh = () => {
    setShouldRefresh(prev => !prev);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setActiveTab('all');
    setSortOrder('asc');
  };

  const getTabCount = (status: CandidateStatus | 'all') => {
    if (status === 'all') {
      return candidates.length;
    }
    return candidates.filter(c => c.status === status).length;
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
            <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os candidatos classificados no concurso
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setShowBulkStatusDialog(true)} variant="outline">
              <ListFilter className="h-4 w-4 mr-2" />
              Atualizar em Massa
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Candidato
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all">
                  Todos ({getTabCount('all')})
                </TabsTrigger>
                <TabsTrigger value="classified">
                  Classificados ({getTabCount('classified')})
                </TabsTrigger>
                <TabsTrigger value="called">
                  Convocados ({getTabCount('called')})
                </TabsTrigger>
                <TabsTrigger value="appointed">
                  Nomeados ({getTabCount('appointed')})
                </TabsTrigger>
                <TabsTrigger value="withdrawn">
                  Desistentes ({getTabCount('withdrawn')})
                </TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou posição..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ordenar por posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Posição (crescente)</SelectItem>
                    <SelectItem value="desc">Posição (decrescente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="m-0">
              {renderCandidatesList()}
            </TabsContent>
            
            <TabsContent value="classified" className="m-0">
              {renderCandidatesList()}
            </TabsContent>
            
            <TabsContent value="called" className="m-0">
              {renderCandidatesList()}
            </TabsContent>
            
            <TabsContent value="appointed" className="m-0">
              {renderCandidatesList()}
            </TabsContent>
            
            <TabsContent value="withdrawn" className="m-0">
              {renderCandidatesList()}
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
      
      {/* Add Candidate Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Candidato</DialogTitle>
            <DialogDescription>
              Preencha as informações do candidato abaixo.
            </DialogDescription>
          </DialogHeader>
          <CandidateForm
            onSuccess={() => {
              setShowAddDialog(false);
              handleRefresh();
              toast.success('Candidato adicionado com sucesso');
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Bulk Status Update Dialog */}
      <Dialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Atualizar Status em Massa</DialogTitle>
            <DialogDescription>
              Selecione os candidatos e o novo status para atualização em massa.
            </DialogDescription>
          </DialogHeader>
          <BulkStatusForm
            filterStatus={statusFilter !== 'all' ? statusFilter : undefined}
            onSuccess={() => {
              setShowBulkStatusDialog(false);
              handleRefresh();
            }}
            onCancel={() => setShowBulkStatusDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderCandidatesList() {
    if (candidates.length === 0) {
      return (
        <EmptyState
          title="Nenhum candidato encontrado"
          description="Comece adicionando candidatos para visualizá-los aqui."
          icon={<Users className="h-10 w-10 text-primary/60" />}
          action={
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Candidato
            </Button>
          }
        />
      );
    }
    
    if (filteredCandidates.length === 0) {
      return (
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Tente ajustar seus filtros para encontrar o que procura."
          icon={<Search className="h-10 w-10 text-primary/60" />}
          action={
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      );
    }
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence>
          {filteredCandidates.map((candidate) => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate} 
              onUpdate={handleRefresh} 
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }
}
