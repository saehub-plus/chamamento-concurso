
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, XCircle } from 'lucide-react';

interface TabCounts {
  all: number;
  classified: number;
  called: number;
  appointed: number;
  withdrawn: number;
  eliminated: number;
}

interface CandidatesFiltersProps {
  activeTab: string;
  searchQuery: string;
  sortOrder: 'asc' | 'desc';
  tabCounts: TabCounts;
  onTabChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearSearch: () => void;
}

export function CandidatesFilters({
  activeTab,
  searchQuery,
  sortOrder,
  tabCounts,
  onTabChange,
  onSearchChange,
  onSortOrderChange,
  onClearSearch
}: CandidatesFiltersProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange}
      className="w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
          <TabsTrigger value="all">
            Todos ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger value="classified">
            Classificados ({tabCounts.classified})
          </TabsTrigger>
          <TabsTrigger value="called">
            Convocados ({tabCounts.called})
          </TabsTrigger>
          <TabsTrigger value="appointed">
            Nomeados ({tabCounts.appointed})
          </TabsTrigger>
          <TabsTrigger value="withdrawn">
            Desistentes ({tabCounts.withdrawn})
          </TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou posição..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Select
            value={sortOrder}
            onValueChange={onSortOrderChange}
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
      
      <TabsContent value="all" className="m-0" />
      <TabsContent value="classified" className="m-0" />
      <TabsContent value="called" className="m-0" />
      <TabsContent value="appointed" className="m-0" />
      <TabsContent value="withdrawn" className="m-0" />
    </Tabs>
  );
}
