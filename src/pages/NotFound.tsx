
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { pageVariants } from '@/utils/animations';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="layout-container flex flex-col items-center justify-center min-h-[70vh] py-8 text-center"
      >
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <FileQuestion className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl mb-6">Página não encontrada</p>
        
        <p className="text-muted-foreground max-w-md mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <Button asChild size="lg">
          <Link to="/">Voltar para o Dashboard</Link>
        </Button>
      </motion.main>
    </div>
  );
}
