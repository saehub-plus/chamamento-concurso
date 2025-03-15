
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { getConvocations } from '@/utils/storage';
import { Convocation } from '@/types';
import { pageVariants } from '@/utils/animations';
import { ConvocationsHeader } from './ConvocationsHeader';
import { ConvocationsFilters } from './ConvocationsFilters';
import { ConvocationsList } from './ConvocationsList';
import { ConvocationFormDialog } from './ConvocationFormDialog';
import { BulkDatesDialog } from './BulkDatesDialog';

export default function Convocations() {
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [filteredConvocations, setFilteredConvocations] = useState<Convocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCalled, setHasCalled] = useState<'all' | 'yes' | 'no'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDatesDialog, setShowBulkDatesDialog] = useState(false);
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
    applyFilters();
  }, [convocations, hasCalled, searchQuery, sortOrder]);

  const applyFilters = () => {
    let result = [...convocations];
    
    // Apply hasCalled filter
    if (hasCalled !== 'all') {
      result = result.filter(
        convocation => hasCalled === 'yes' ? convocation.hasCalled : !convocation.hasCalled
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        convocation => 
          (convocation.notes && convocation.notes.toLowerCase().includes(query)) ||
          new Date(convocation.date).toLocaleDateString().includes(query)
      );
    }
    
    // Apply sort order
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredConvocations(result);
  };

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
        <ConvocationsHeader 
          onAddConvocation={() => setShowAddDialog(true)}
          onAddBulkDates={() => setShowBulkDatesDialog(true)}
        />
        
        <div className="space-y-4">
          <ConvocationsFilters
            searchQuery={searchQuery}
            hasCalled={hasCalled}
            sortOrder={sortOrder}
            onSearchChange={(value) => setSearchQuery(value)}
            onHasCalledChange={(value) => setHasCalled(value as 'all' | 'yes' | 'no')}
            onSortOrderChange={(value) => setSortOrder(value as 'desc' | 'asc')}
            onClearSearch={() => setSearchQuery('')}
          />
          
          <ConvocationsList
            convocations={convocations}
            filteredConvocations={filteredConvocations}
            onAdd={() => setShowAddDialog(true)}
            onClearFilters={clearFilters}
            onUpdate={handleRefresh}
          />
        </div>
      </motion.main>
      
      <ConvocationFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleRefresh}
      />

      <BulkDatesDialog
        open={showBulkDatesDialog}
        onOpenChange={setShowBulkDatesDialog}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
