
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
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
import { PredictionHeader } from './prediction/PredictionHeader';
import { PredictionProgress } from './prediction/PredictionProgress';
import { PredictionDetails } from './prediction/PredictionDetails';
import { PredictionMotivational } from './prediction/PredictionMotivational';
import { PredictionActions } from './prediction/PredictionActions';

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

  // Function to calculate prediction and set user info
  const calculatePrediction = () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      setHasUser(false);
      return;
    }

    const candidate = getCandidateById(currentUserId);
    if (candidate) {
      setHasUser(true);
      setUserName(candidate.name);
      setUserPosition(candidate.position);
      
      // Calculate prediction
      const candidatePrediction = predictCandidateCall(candidate.position, new Date());
      setPrediction({
        date: candidatePrediction.predictedDate ? 
          format(candidatePrediction.predictedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 
          null,
        businessDays: candidatePrediction.estimatedBusinessDays,
        averageCallsPerDay: candidatePrediction.averageCallsPerDay,
        remainingCalls: candidatePrediction.remainingCalls,
        confidence: candidatePrediction.confidence
      });
      
      // Calculate progress
      const progressPercent = getCallProgress(candidate.position);
      setProgress(progressPercent);
    } else {
      setHasUser(false);
    }
  };

  // Initial calculation
  useEffect(() => {
    calculatePrediction();
  }, []);

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
          {/* Header with user info */}
          <PredictionHeader userName={userName} userPosition={userPosition} />
          
          {/* Progress Indicator */}
          <PredictionProgress progress={progress} />
          
          {/* Actions */}
          <PredictionActions onUpdateDate={calculatePrediction} />
          
          {/* Detailed Prediction Analysis */}
          <PredictionDetails prediction={prediction} />
          
          {/* Motivational Message */}
          <PredictionMotivational progress={progress} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
