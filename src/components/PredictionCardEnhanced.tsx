
import React, { useState } from 'react';
import { PredictionCard } from '@/components/PredictionCard';
import { DocumentWarningsAlert } from '@/components/prediction/DocumentWarningsAlert';
import { PredictionScenarios } from '@/components/prediction/PredictionScenarios';
import { AvailablePositions } from '@/components/prediction/AvailablePositions';
import { getCurrentUserId, getCandidateById, predictCandidateCall } from '@/utils/storage';
import { PartyPopper, UmbrellaOff, ArrowRightCircle, X, AlertTriangle, CheckCircle, User, FileText, Stethoscope, FileBadge2, CalendarDays, CheckCircle2, Sparkles, Star, Award, Medal, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

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
      
      // Generate scenarios based on the prediction
      const businessDays = prediction.estimatedBusinessDays;
      if (businessDays > 0 && prediction.predictedDate) {
        // Create scenarios manually since they're not part of the prediction return type
        scenarios = {
          pessimistic: { 
            date: new Date(prediction.predictedDate.getTime() + (5 * 24 * 60 * 60 * 1000)), 
            businessDays: businessDays + 5 
          },
          realistic: { 
            date: prediction.predictedDate, 
            businessDays: businessDays 
          },
          optimistic: { 
            date: new Date(prediction.predictedDate.getTime() - (3 * 24 * 60 * 60 * 1000)), 
            businessDays: Math.max(1, businessDays - 3) 
          }
        };
        hasScenarios = true;
      }
    }
  }
  
  // Determine which content to show based on candidate status
  if (candidateStatus === 'called') {
    return <ConvocationSteps status="called" />;
  } else if (candidateStatus === 'appointed') {
    return <AppointmentCelebration />;
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

function ConvocationSteps({ status }: { status: 'called' }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  React.useEffect(() => {
    toast.success('Parabéns! Você foi convocado!', {
      position: 'top-center',
      duration: 5000,
    });
  }, []);

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

  const toggleStepCompletion = (stepIndex: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepIndex)) {
        return prev.filter(i => i !== stepIndex);
      } else {
        return [...prev, stepIndex];
      }
    });
  };
  
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
            <span className="flex items-center">
              <PartyPopper className="h-6 w-6 mr-2 text-yellow-500" />
              Você foi convocado!
            </span>
          </h3>
          <Badge variant="default" className="text-sm">
            Convocado
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
                completedSteps.includes(index) ? "bg-green-50 border border-green-200" : 
                "bg-gray-50 border border-gray-200"
              )}
            >
              <Checkbox 
                id={`step-${index}`}
                checked={completedSteps.includes(index)}
                onCheckedChange={() => toggleStepCompletion(index)}
                className="mt-1"
              />
              
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
                completedSteps.includes(index) ? "bg-green-500 text-white" : 
                "bg-gray-200 text-gray-500"
              )}>
                {completedSteps.includes(index) ? (
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

function AppointmentCelebration() {
  React.useEffect(() => {
    toast.success('Parabéns! Você foi nomeado e está pronto para iniciar sua carreira!', {
      position: 'top-center', 
      duration: 5000,
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-xy"
        style={{ backgroundSize: "200% 200%" }}
      />
      
      <Card className="border-green-300 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg relative overflow-hidden">
        <motion.div 
          className="absolute -top-10 -right-10 w-40 h-40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full bg-yellow-300/20" />
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-10 -left-10 w-32 h-32"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full bg-green-300/20" />
        </motion.div>
        
        <CardContent className="pt-6 relative z-10">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <motion.div 
              className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center"
              initial={{ y: -20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Trophy className="h-12 w-12 text-green-600" />
            </motion.div>
            
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-3xl font-bold text-green-700 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
                  Parabéns!
                  <Sparkles className="h-6 w-6 text-yellow-500 ml-2" />
                </h3>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="text-2xl font-semibold text-green-600">Você foi nomeado!</h4>
              </motion.div>
            </div>
            
            <motion.p 
              className="text-green-600 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Sua jornada no concurso da Prefeitura de Joinville chegou ao sucesso! 
              Você completou todas as etapas e agora é oficialmente um servidor público.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Badge className="bg-green-500 text-white hover:bg-green-600 px-3 py-1">
                <Award className="h-4 w-4 mr-1" />
                Nomeado
              </Badge>
              
              <Badge variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                Missão cumprida
              </Badge>
              
              <Badge variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 px-3 py-1">
                <Medal className="h-4 w-4 mr-1" />
                Servidor Público
              </Badge>
            </motion.div>
            
            <motion.div 
              className="space-y-3 bg-white/80 p-4 rounded-lg border border-green-200 text-left max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <h5 className="font-semibold text-green-700 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Próximos passos:
              </h5>
              
              <div className="ml-7 space-y-2">
                <p className="text-sm flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">1</span>
                  <span>Compareça ao local designado para iniciar suas atividades</span>
                </p>
                
                <p className="text-sm flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">2</span>
                  <span>Conheça sua equipe e supervisor</span>
                </p>
                
                <p className="text-sm flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">3</span>
                  <span>Participe dos treinamentos iniciais</span>
                </p>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <p className="text-sm text-muted-foreground">
              Bem-vindo à Prefeitura de Joinville! Sua dedicação e esforço renderam frutos.
              Desejamos muito sucesso em sua nova carreira!
            </p>
          </motion.div>
        </CardContent>
      </Card>
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
