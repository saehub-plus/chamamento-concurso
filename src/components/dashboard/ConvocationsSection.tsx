
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllConvocations, getAllCandidates, getCompletedDocumentsCount } from '@/utils/storage';
import { Users, Calendar, UserCheck } from 'lucide-react';

export function ConvocationsSection() {
  const navigate = useNavigate();
  const convocations = getAllConvocations();
  const candidates = getAllCandidates();
  
  // Count convocations with candidates
  const convocationsWithCandidates = convocations.filter(conv => conv.candidateId).length;
  
  // Calculate remaining positions
  const eliminatedCandidates = candidates.filter(c => c.status === 'eliminated').length;
  const withdrawnCandidates = candidates.filter(c => c.status === 'withdrawn').length;
  const calledCandidates = candidates.filter(c => c.status === 'called').length;
  
  // Calculate available positions: (Eliminated + Withdrawn) - Called
  const availablePositions = (eliminatedCandidates + withdrawnCandidates) - calledCandidates;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Convocações Registradas
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{convocationsWithCandidates}</div>
          <p className="text-xs text-muted-foreground">
            Total de candidatos convocados
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/convocations')}>
            <Calendar className="mr-2 h-4 w-4" />
            Ver Convocações
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Vagas Disponíveis
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{availablePositions > 0 ? availablePositions : 0}</div>
          <p className="text-xs text-muted-foreground">
            Vagas que podem ser preenchidas
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/candidates')}>
            <Users className="mr-2 h-4 w-4" />
            Ver Candidatos
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Conclusão
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getCompletedDocumentsCount()}%</div>
          <p className="text-xs text-muted-foreground">
            Documentos completos para sua convocação
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/documents')}>
            <UserCheck className="mr-2 h-4 w-4" />
            Ver Situação
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
