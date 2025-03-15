
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { getCandidates } from '@/utils/storage';
import { Candidate, CandidateStatus } from '@/types';
import { pageVariants } from '@/utils/animations';
import { CandidatesHeader } from './CandidatesHeader';
import { CandidatesFilters } from './CandidatesFilters';
import { CandidatesList } from './CandidatesList';
import { CandidateFormDialog } from './CandidateFormDialog';
import { BulkStatusDialog } from './BulkStatusDialog';

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
    applyFilters();
  }, [candidates, statusFilter, searchQuery, sortOrder]);

  const applyFilters = () => {
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
      return sortOrder === 'asc' ? a.position - b.position : b.position - a.position;
    });
    
    setFilteredCandidates(result);
  };

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
        <CandidatesHeader 
          onAddCandidate={() => setShowAddDialog(true)}
          onBulkUpdate={() => setShowBulkStatusDialog(true)}
        />
        
        <div className="space-y-4">
          <CandidatesFilters
            activeTab={activeTab}
            searchQuery={searchQuery}
            sortOrder={sortOrder}
            tabCounts={{
              all: getTabCount('all'),
              classified: getTabCount('classified'),
              called: getTabCount('called'),
              appointed: getTabCount('appointed'),
              withdrawn: getTabCount('withdrawn'),
              eliminated: getTabCount('eliminated')
            }}
            onTabChange={handleTabChange}
            onSearchChange={(value) => setSearchQuery(value)}
            onSortOrderChange={(value) => setSortOrder(value as 'asc' | 'desc')}
            onClearSearch={() => setSearchQuery('')}
          />
          
          <CandidatesList
            candidates={candidates}
            filteredCandidates={filteredCandidates}
            onAdd={() => setShowAddDialog(true)}
            onClearFilters={clearFilters}
            onUpdate={handleRefresh}
          />
        </div>
      </motion.main>
      
      <CandidateFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleRefresh}
      />
      
      <BulkStatusDialog
        open={showBulkStatusDialog}
        onOpenChange={setShowBulkStatusDialog}
        filterStatus={statusFilter !== 'all' ? statusFilter : undefined}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
