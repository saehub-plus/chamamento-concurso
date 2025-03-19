import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Rocket, Flag, Timer, User, Calendar, TrendingUp, Clock } from 'lucide-react';
import { scaleVariants } from '@/utils/animations';
import { 
  getCandidates, 
  getCurrentUserId,
  getCandidateById, 
  predictCandidateCall, 
  getCallProgress 
} from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Motivational messages based on progress
const getMotivationalMessage = (progress: number): { message: string; icon: JSX.Element } => {
  if (progress > 90) {
    return { 
      message: 'Você está prestes a ser chamado! Continue acompanhando as convocações!', 
      icon: <Trophy className="h-5 w-5 text-yellow-500" />
    };
  } else if (progress > 70) {
    return { 
      message: 'Sua convocação está se aproximando rapidamente! Continue firme!', 
      icon: <Rocket className="h-5 w-5 text-blue-500" />
    };
  } else if (progress > 50) {
    return { 
      message: 'Você já passou da metade do caminho! Continue persistindo!', 
      icon: <Flag className="h-5 w-5 text-green-500" />
    };
  } else if (progress > 30) {
    return { 
      message: 'Continue acompanhando as convocações, o processo está avançando!', 
      icon: <Timer className="h-5 w-5 text-purple-500" />
    };
  } else {
    return { 
      message: 'Paciência e persistência! Cada convocação te aproxima mais do seu objetivo.', 
      icon: <Timer className="h-5 w-5 text-indigo-500" />
    };
  }
};

export function PredictionCard() {
  const navigate = useNavigate();
  const [hasUser, setHasUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPosition, setUserPosition] = useState(0);
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState<{
    date: string | null;
    businessDays: number;
    averageCallsPerDay: {
      overall: number;
      last30Days: number;
      last90Days: number;
      dynamic: number;
    };
    remainingCalls: number;
    confidence: 'high' | 'medium' | 'low';
  }>({
    date: null,
    businessDays: 0,
    averageCallsPerDay: {
      overall: 0,
      last30Days: 0,
      last90Days: 0,
      dynamic: 0
    },
    remainingCalls: 0,
    confidence: 'low'
  });

  // Obtenha a lista de candidatos do storage
  const candidates = getCandidates();
  const currentUserId = getCurrentUserId();
  const candidate = currentUserId ? getCandidateById(currentUserId) : null;

  // useEffect para recalcular a previsão sempre que o número de candidatos ou a posição do candidato mudar
  useEffect(() => {
    console.log("[PredictionCard] Iniciando useEffect com currentUserId:", currentUserId);
    if (!currentUserId || !candidate) {
      setHasUser(false);
      console.log("[PredictionCard] Nenhum candidato encontrado.");
      return;
    }
    setHasUser(true);
    setUserName(candidate.name);
    setUserPosition(candidate.position);
    
    // Recalcula a previsão com base na posição do candidato
    const candidatePrediction = predictCandidateCall(candidate.position);
    console.log("[PredictionCard] Resultado de predictCandidateCall:", candidatePrediction);

    setPrediction({
      date: candidatePrediction.predictedDate ? 
        format(candidatePrediction.predictedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 
        null,
      businessDays: candidatePrediction.estimatedBusinessDays,
      averageCallsPerDay: candidatePrediction.averageCallsPerDay,
      remainingCalls: candidatePrediction.remainingCalls,
      confidence: candidatePrediction.confidence
    });
    
    const progressPercent = getCallProgress(candidate.position);
    console.log("[PredictionCard] Progresso calculado:", progressPercent);
    setProgress(progressPercent);
  }, [candidate, candidate.position, candidates.length, currentUserId]);

  const motivational = getMotivationalMessage(progress);

  if (!hasUser) {
    return (
      <motion.div variants={scaleVariants} initial="hidden" animate="visible">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Previsão de Chamamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 flex flex-col items-center justify-center py-6">
              <p className="text-center text-muted-foreground">
                Selecione qual candidato é você para ver sua previsão de chamamento
              </p>
              <Button variant="default" className="w-full" onClick={() => navigate('/candidates')}>
                <User className="h-4 w-4 mr-2" />
                Selecionar meu nome na lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={scaleVariants} initial="hidden" animate="visible">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sua Previsão de Chamamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{userName}</h3>
            <span className="text-muted-foreground text-sm">(Posição #{userPosition})</span>
          </div>
          
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progresso para Chamamento</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="relative pt-1">
              <Progress value={progress} className="h-4" />
              <div className="flex justify-between absolute w-full bottom-2">
                <div className="h-3 w-3 bg-primary rounded-full mt-1 -ml-1.5"></div>
                {progress > 0 && (
                  <div
                    className="h-3 w-3 bg-primary rounded-full mt-1 -ml-1.5 relative"
                    style={{ left: `${progress}%` }}
                  >
                    <div className="absolute top-[-24px] left-[-8px]">
                      <div className="animate-bounce">
                        <span className="inline-flex justify-center items-center h-6 w-6 rounded-full bg-primary shadow text-white text-xs">
                          Você
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-3 w-3 border-2 border-primary rounded-full mt-1 -mr-1.5">
                  <Trophy className="h-4 w-4 text-primary absolute -top-6 -right-1.5 transform translate-x-1/2" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Prediction Analysis */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-3">
              {prediction.date && (
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Previsão para chamamento
                    </div>
                    <div className="text-xs bg-primary/20 px-2 py-0.5 rounded">
                      {prediction.confidence === 'high' ? 'Alta confiança' : 
                       prediction.confidence === 'medium' ? 'Média confiança' : 'Baixa confiança'}
                    </div>
                  </div>
                  <div className="font-semibold mt-1">{prediction.date}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Aproximadamente {prediction.businessDays} dias úteis
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Média de chamamentos por dia
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Geral:</span>
                      <span className="font-medium">{prediction.averageCallsPerDay.overall}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Últimos 30 dias:</span>
                      <span className="font-medium">{prediction.averageCallsPerDay.last30Days}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Últimos 90 dias:</span>
                      <span className="font-medium">{prediction.averageCallsPerDay.last90Days}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t">
                      <span className="text-xs font-medium">Média ponderada:</span>
                      <span className="font-semibold text-primary">{prediction.averageCallsPerDay.dynamic}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Situação atual
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Candidatos à sua frente:</span>
                      <span className="font-medium">{prediction.remainingCalls}</span>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        A previsão considera o histórico de chamamentos e calcula uma média dinâmica, priorizando os dados mais recentes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Motivational Message */}
          <div className="bg-primary/10 rounded-lg p-4 flex items-start space-x-3">
            <div className="mt-0.5">{motivational.icon}</div>
            <p className="text-sm">{motivational.message}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
