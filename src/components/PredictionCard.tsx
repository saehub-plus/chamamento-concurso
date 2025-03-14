
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Rocket, Flag, Timer, User } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState<{
    date: string | null;
    callsPerMonth: number;
    remainingCalls: number;
    confidence: 'high' | 'medium' | 'low';
  }>({
    date: null,
    callsPerMonth: 0,
    remainingCalls: 0,
    confidence: 'low'
  });

  // Calculate prediction and set user info
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      setHasUser(false);
      return;
    }

    const candidate = getCandidateById(currentUserId);
    if (candidate) {
      setHasUser(true);
      setUserName(candidate.name);
      
      // Calculate prediction
      const candidatePrediction = predictCandidateCall(candidate.position);
      setPrediction({
        date: candidatePrediction.predictedDate ? 
          format(candidatePrediction.predictedDate, "MMMM 'de' yyyy", { locale: ptBR }) : 
          null,
        callsPerMonth: candidatePrediction.callsPerMonth,
        remainingCalls: candidatePrediction.remainingCalls,
        confidence: candidatePrediction.confidence
      });
      
      // Calculate progress
      const progressPercent = getCallProgress(candidate.position);
      setProgress(progressPercent);
    } else {
      setHasUser(false);
    }
  }, []);

  const motivational = getMotivationalMessage(progress);
  
  // Show placeholder when no user is identified
  if (!hasUser) {
    return (
      <motion.div
        variants={scaleVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Previsão de Chamamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 flex flex-col items-center justify-center py-6">
              <p className="text-center text-muted-foreground">
                Selecione qual candidato é você para ver sua previsão de chamamento
              </p>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate('/candidates')}
              >
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
    <motion.div
      variants={scaleVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sua Previsão de Chamamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{userName}</h3>
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
          
          {/* Prediction Details */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-3">
              {prediction.date && (
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Previsão para chamamento</div>
                  <div className="font-semibold">{prediction.date}</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Chamamentos por mês</div>
                  <div className="font-semibold">{prediction.callsPerMonth}</div>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Candidatos na sua frente</div>
                  <div className="font-semibold">{prediction.remainingCalls}</div>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Confiança da previsão</div>
                <div className="font-semibold">
                  {prediction.confidence === 'high' ? 'Alta' : 
                   prediction.confidence === 'medium' ? 'Média' : 'Baixa'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Motivational Message */}
          <div className="bg-primary/10 rounded-lg p-4 flex items-start space-x-3">
            <div className="mt-0.5">
              {motivational.icon}
            </div>
            <p className="text-sm">{motivational.message}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
