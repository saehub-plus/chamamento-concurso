
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Calendar as CalendarIcon, CalendarPlus, Search, CalendarDays, XCircle } from 'lucide-react';
import { getConvocations } from '@/utils/storage';
import { Convocation } from '@/types';
import { ConvocationCard } from '@/components/ConvocationCard';
import { ConvocationForm } from '@/components/ConvocationForm';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { pageVariants, containerVariants } from '@/utils/animations';

export default function Convocations() {
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [filteredConvocations, setFilteredConvocations] = useState<Convocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCalled, setHasCalled] = useState<'all' | 'yes' | 'no'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Load convocations from storage
  useEffect(() => {
    const loadData = () => {
      const data = getConvocations();
      setConvocations(data);
    };
    
    loadData();
  }, [shouldRefresh]);

  // Apply filters and search
  useEffect(() => {
    let result = [...convocations];
    
    // Apply hasCalled filter
    if (hasCalled !== 'all') {
      result = result.filter(
        convocation => hasCalled === 'yes' ? convocation.hasCalled : !convocation.hasCalled
      );
    }
    
    // Apply search filter (for notes)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        convocation => 
          (convocation.notes && convocation.notes.toLowerCase().includes(query)) ||
          format(new Date(convocation.date), 'dd/MM/yyyy').includes(query)
      );
    }
    
    // Apply sort order
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (sortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredConvocations(result);
  }, [convocations, hasCalled, searchQuery, sortOrder]);

  const handleRefresh = () => {
    setShouldRefresh(prev => !prev);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setHasCalled('all');
    setSortOrder('desc');
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
            <h1 className="text-3xl font-bold tracking-tight">Convocações</h1>
            <p className="text-muted-foreground mt-1">
              Registre e acompanhe as convocações realizadas
            </p>
          </div>
          
          <Button onClick={() => setShowAddDialog(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Nova Convocação
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-1 gap-2">
              <Select
                value={hasCalled}
                onValueChange={(value) => setHasCalled(value as 'all' | 'yes' | 'no')}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as convocações</SelectItem>
                  <SelectItem value="yes">Com candidatos convocados</SelectItem>
                  <SelectItem value="no">Sem candidatos convocados</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as 'desc' | 'asc')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mais recentes primeiro</SelectItem>
                  <SelectItem value="asc">Mais antigas primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por data ou observações..."
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
          </div>
          
          {renderConvocationsList()}
        </div>
      </motion.main>
      
      {/* Add Convocation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Convocação</DialogTitle>
            <DialogDescription>
              Preencha as informações da convocação abaixo.
            </DialogDescription>
          </DialogHeader>
          <ConvocationForm
            onSuccess={() => {
              setShowAddDialog(false);
              handleRefresh();
              toast.success('Convocação registrada com sucesso');
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderConvocationsList() {
    if (convocations.length === 0) {
      return (
        <EmptyState
          title="Nenhuma convocação registrada"
          description="Comece registrando convocações para visualizá-las aqui."
          icon={<CalendarDays className="h-10 w-10 text-primary/60" />}
          action={
            <Button onClick={() => setShowAddDialog(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Registrar Convocação
            </Button>
          }
        />
      );
    }
    
    if (filteredConvocations.length === 0) {
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {filteredConvocations.map((convocation) => (
            <ConvocationCard 
              key={convocation.id} 
              convocation={convocation} 
              onUpdate={handleRefresh} 
            />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }
}
