
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useCompetition } from '@/context/CompetitionContext';
import { pageVariants } from '@/utils/animations';

export default function Home() {
  const { setCurrentCompetition } = useCompetition();

  const competitions = [
    {
      id: 'joinville',
      title: 'Concurso Público EDITAL Nº 001/2024/SGP.UDS',
      location: 'Joinville',
      logo: '/lovable-uploads/2ffdbb6f-3cb5-4fa5-9565-5d87797f474f.png',
      path: '/joinville',
      color: 'bg-blue-600'
    },
    {
      id: 'florianopolis-concurso',
      title: 'Concurso Público EDITAL Nº 001/2024',
      location: 'Florianópolis',
      logo: '/lovable-uploads/cedd88cf-ba98-4c11-8c7f-caae4b6289e9.png',
      path: '/florianopolis-concurso',
      color: 'bg-cyan-600'
    },
    {
      id: 'florianopolis-processo',
      title: 'Processo Seletivo Simplificado nº 004/2025',
      location: 'Florianópolis',
      logo: '/lovable-uploads/cedd88cf-ba98-4c11-8c7f-caae4b6289e9.png',
      path: '/florianopolis-processo',
      color: 'bg-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-background/90 border-b py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">
            <span className="text-primary">Acompanhamento</span>
            <span className="text-muted-foreground ml-1">de Concursos</span>
          </h1>
        </div>
      </header>
      
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Selecione um Concurso</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Escolha um dos concursos abaixo para acompanhar as convocações, seus documentos e muito mais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mt-8">
            {competitions.map((competition) => (
              <Link 
                key={competition.id}
                to={competition.path}
                onClick={() => setCurrentCompetition(competition.id as any)}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card className="overflow-hidden border-2 hover:border-primary hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-center">
                        <div className={`${competition.color} p-6 md:p-8 flex items-center justify-center md:w-1/3`}>
                          <img 
                            src={competition.logo} 
                            alt={`Logo ${competition.location}`} 
                            className="h-24 md:h-32 w-auto object-contain"
                          />
                        </div>
                        <div className="p-6 md:p-8 md:w-2/3">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            {competition.location}
                          </div>
                          <h2 className="text-2xl font-bold mb-2">{competition.title}</h2>
                          <div className="text-sm text-muted-foreground">
                            Clique para acessar o acompanhamento deste concurso
                          </div>
                          <div className="mt-4 inline-flex items-center text-primary font-medium">
                            Acessar dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.main>
      
      <footer className="py-6 border-t mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Acompanhamento de Concursos Públicos
        </div>
      </footer>
    </div>
  );
}
