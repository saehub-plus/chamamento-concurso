
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getCandidates } from '@/utils/storage/candidateStorage';
import { UserCheck, UserMinus, UserX, Users } from 'lucide-react';

export function AvailablePositions() {
  const candidates = getCandidates();
  
  // Count candidates by status
  const withdrawn = candidates.filter(c => c.status === 'withdrawn').length;
  const eliminated = candidates.filter(c => c.status === 'eliminated').length;
  const called = candidates.filter(c => c.status === 'called' || c.status === 'appointed').length;
  
  // Calculate available positions correctly
  // Available = (Eliminated + Withdrawn) - Called
  const availablePositions = (eliminated + withdrawn) - called;
  
  return (
    <Card className="bg-primary/5 rounded-lg">
      <CardContent className="p-3">
        <div className="text-sm text-muted-foreground flex items-center mb-2">
          <Users className="h-4 w-4 mr-1" />
          Vagas Disponíveis
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">
            {availablePositions > 0 ? availablePositions : 0}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground space-x-2">
            <div className="flex items-center">
              <UserX className="h-3 w-3 mr-1 text-red-500" />
              <span>{eliminated}</span>
            </div>
            <span>+</span>
            <div className="flex items-center">
              <UserMinus className="h-3 w-3 mr-1 text-amber-500" />
              <span>{withdrawn}</span>
            </div>
            <span>-</span>
            <div className="flex items-center">
              <UserCheck className="h-3 w-3 mr-1 text-green-500" />
              <span>{called}</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Este é o número de vagas que se tornaram disponíveis devido a eliminações ({eliminated}) e 
          desistências ({withdrawn}), menos as que já foram preenchidas por convocações ({called}).
        </div>
      </CardContent>
    </Card>
  );
}
