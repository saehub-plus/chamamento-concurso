
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CalendarPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { ConvocationCard } from '@/components/ConvocationCard';
import { Convocation } from '@/types';
import { containerVariants } from '@/utils/animations';

interface ConvocationsListProps {
  convocations: Convocation[];
  filteredConvocations: Convocation[];
  onAdd: () => void;
  onClearFilters: () => void;
  onUpdate: () => void;
}

export function ConvocationsList({ 
  convocations, 
  filteredConvocations, 
  onAdd, 
  onClearFilters, 
  onUpdate 
}: ConvocationsListProps) {
  if (convocations.length === 0) {
    return (
      <EmptyState
        title="Nenhuma convocação registrada"
        description="Comece registrando convocações para visualizá-las aqui."
        icon={<CalendarDays className="h-10 w-10 text-primary/60" />}
        action={
          <Button onClick={onAdd}>
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
          <Button variant="outline" onClick={onClearFilters}>
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
            onUpdate={onUpdate} 
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
