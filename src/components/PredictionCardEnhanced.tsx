
import React from 'react';
import { PredictionCard } from '@/components/PredictionCard';
import { DocumentWarningsAlert } from '@/components/prediction/DocumentWarningsAlert';
import { PredictionScenarios } from '@/components/prediction/PredictionScenarios';
import { AvailablePositions } from '@/components/prediction/AvailablePositions';
import { getCurrentUserId, getCandidateById, predictCandidateCall } from '@/utils/storage';
import { Confetti, PartyPopper, UmbrellaOff, ArrowRightCircle, X, AlertTriangle, CheckCircle, User, FileText, Stethoscope, FileBadge2, CalendarDays, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function PredictionCardEnhanced() {
  // Get prediction date for document warnings
  const currentUserId = getCurrentUserId();
  let predictedDate: Date | null = null;
  let hasScenarios = false;
  let scenarios = {
    pessimistic: { date: null, businessDays: 0 },
    realistic: { date: null, businessDays: 0 },
    optimistic: { date: null, businessDays: 0 }
  };
  let candidateStatus = null;
  
  if (currentUserId) {
    const candidate = getCandidateById(currentUserId);
    if (candidate) {
      candidateStatus = candidate.status;
      const prediction = predictCandidateCall(candidate.position);
      predictedDate = prediction.predictedDate;
      scenarios = prediction.scenarios;
      hasScenarios = true;
    }
  }
  
  // Determine which content to show based on candidate status
  if (candidateStatus === 'called' || candidateStatus === 'appointed') {
    return <ConvocationSteps status={candidateStatus} />;
  } else if (candidateStatus === 'eliminated') {
    return <EliminationMessage />;
  } else {
    // Regular prediction content for classified or other statuses
    return (
      <div className="space-y-4">
        <PredictionCard />
        <DocumentWarningsAlert predictedDate={predictedDate} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasScenarios && (
            <PredictionScenarios scenarios={scenarios} />
          )}
          <AvailablePositions />
        </div>
      </div>
    );
  }
}

function ConvocationSteps({ status }: { status: 'called' | 'appointed' }) {
  const stepProgress = status === 'appointed' ? 4 : 1;
  
  React.useEffect(() => {
    if (status === 'called') {
      toast.success('Parabéns! Você foi convocado!', {
        position: 'top-center',
        duration: 5000,
      });
    } else if (status === 'appointed') {
      toast.success('Parabéns! Você foi nomeado!', {
        position: 'top-center', 
        duration: 5000,
      });
    }
  }, [status]);

  const steps = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Envio dos Documentos",
      description: "Envie todos os documentos exigidos em até 48h úteis após a convocação.",
      deadline: "Até 2 dias úteis após a convocação"
    },
    {
      icon: <User className="h-5 w-5" />,
      title: "Análise dos Documentos",
      description: "A equipe do RH da Prefeitura verificará sua documentação.",
      warning: "A falta de documentos ou irregularidades pode resultar em eliminação."
    },
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: "Exame Médico Admissional",
      description: "Realize o exame médico admissional após aprovação da documentação.",
      warning: "Inaptidão no exame médico pode resultar em eliminação."
    },
    {
      icon: <FileBadge2 className="h-5 w-5" />,
      title: "Publicação da Nomeação",
      description: "Aguarde a publicação de sua nomeação no Diário Oficial do Município.",
      link: "https://www.joinville.sc.gov.br/jornal"
    },
    {
      icon: <CalendarDays className="h-5 w-5" />,
      title: "Posse",
      description: "Compareça ao RH para assinar os documentos de posse.",
      deadline: "Até 30 dias após a nomeação",
      warning: "Não comparecer no prazo resulta em eliminação."
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Exercício do Cargo",
      description: "Inicie suas atividades no local designado.",
      deadline: "Até 15 dias após a posse"
    }
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-primary">
            {status === 'called' ? (
              <span className="flex items-center">
                <PartyPopper className="h-6 w-6 mr-2 text-yellow-500" />
                Você foi convocado!
              </span>
            ) : (
              <span className="flex items-center">
                <Confetti className="h-6 w-6 mr-2 text-green-500" />
                Você foi nomeado!
              </span>
            )}
          </h3>
          <Badge variant={status === 'called' ? "default" : "success"} className="text-sm">
            {status === 'called' ? 'Convocado' : 'Nomeado'}
          </Badge>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          📌 Siga cuidadosamente estes passos para garantir sua vaga no concurso de Joinville:
        </motion.p>
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={cn(
                "flex gap-4 p-4 rounded-lg transition-all",
                index < stepProgress ? "bg-green-50 border border-green-200" : 
                index === stepProgress ? "bg-blue-50 border border-blue-200" : 
                "bg-gray-50 border border-gray-200"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
                index < stepProgress ? "bg-green-500 text-white" : 
                index === stepProgress ? "bg-blue-500 text-white" : 
                "bg-gray-200 text-gray-500"
              )}>
                {index < stepProgress ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  step.icon
                )}
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold">
                  {index + 1}. {step.title}
                </h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                
                {step.deadline && (
                  <div className="flex items-center mt-1 text-sm text-blue-600">
                    <ArrowRightCircle className="h-4 w-4 mr-1" />
                    <span>Prazo: {step.deadline}</span>
                  </div>
                )}
                
                {step.warning && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>{step.warning}</span>
                  </div>
                )}
                
                {step.link && (
                  <a 
                    href={step.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-1 text-sm text-primary hover:underline"
                  >
                    <ArrowRightCircle className="h-4 w-4 mr-1" />
                    <span>Acessar Diário Oficial</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EliminationMessage() {
  React.useEffect(() => {
    toast.error('Você foi eliminado do concurso', {
      position: 'top-center',
      duration: 5000,
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-red-300 bg-red-50 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <UmbrellaOff className="h-10 w-10 text-red-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-red-700">Você foi eliminado do concurso</h3>
            
            <p className="text-red-600 max-w-lg">
              Infelizmente, seu status no concurso consta como eliminado. Isso pode ter ocorrido 
              por diversos motivos, como pendências na documentação, reprovação no exame médico 
              ou não comparecimento dentro dos prazos estipulados.
            </p>
            
            <div className="flex items-center justify-center mt-4 space-x-4">
              <Badge variant="destructive" className="text-sm">
                <X className="h-4 w-4 mr-1" />
                Eliminado
              </Badge>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              Se você acredita que houve um erro, entre em contato com a Prefeitura de Joinville 
              para verificar a situação e possíveis recursos.
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
