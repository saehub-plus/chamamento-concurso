
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, XCircle } from 'lucide-react';

interface ConvocationsFiltersProps {
  searchQuery: string;
  hasCalled: 'all' | 'yes' | 'no';
  sortOrder: 'desc' | 'asc';
  onSearchChange: (value: string) => void;
  onHasCalledChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onClearSearch: () => void;
}

export function ConvocationsFilters({
  searchQuery,
  hasCalled,
  sortOrder,
  onSearchChange,
  onHasCalledChange,
  onSortOrderChange,
  onClearSearch
}: ConvocationsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="flex flex-1 gap-2">
        <Select
          value={hasCalled}
          onValueChange={onHasCalledChange}
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
          onValueChange={onSortOrderChange}
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
    </div>
  );
}
