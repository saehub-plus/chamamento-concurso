
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { CandidateCard } from '@/components/CandidateCard';
import { Candidate } from '@/types';
import { containerVariants } from '@/utils/animations';

interface CandidatesListProps {
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  onAdd: () => void;
  onClearFilters: () => void;
  onUpdate: () => void;
}

export function CandidatesList({ 
  candidates, 
  filteredCandidates, 
  onAdd, 
  onClearFilters, 
  onUpdate 
}: CandidatesListProps) {
  if (candidates.length === 0) {
    return (
      <EmptyState
        title="Nenhum candidato encontrado"
        description="Comece adicionando candidatos para visualizá-los aqui."
        icon={<Users className="h-10 w-10 text-primary/60" />}
        action={
          <Button onClick={onAdd}>
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AnimatePresence>
        {filteredCandidates.map((candidate) => (
          <CandidateCard 
            key={candidate.id} 
            candidate={candidate} 
            onUpdate={onUpdate} 
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
