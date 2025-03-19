
import React from 'react';
import { Trophy, Rocket, Flag, Timer } from 'lucide-react';

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

interface PredictionMotivationalProps {
  progress: number;
}

export function PredictionMotivational({ progress }: PredictionMotivationalProps) {
  const motivational = getMotivationalMessage(progress);
  
  return (
    <div className="bg-primary/10 rounded-lg p-4 flex items-start space-x-3">
      <div className="mt-0.5">
        {motivational.icon}
      </div>
      <p className="text-sm">{motivational.message}</p>
    </div>
  );
}
