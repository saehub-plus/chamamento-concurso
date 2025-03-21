
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Users, Calendar, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompetition } from '@/context/CompetitionContext';

export function Header() {
  const location = useLocation();
  const { currentCompetition, getCompetitionLogo, getCompetitionTitle } = useCompetition();
  
  // Update paths based on current competition
  const basePath = `/${currentCompetition}`;
  
  const navItems = [
    { 
      path: '/', 
      label: 'Início', 
      icon: <Home className="w-4 h-4 mr-2" />,
      exact: true
    },
    { 
      path: basePath, 
      label: 'Dashboard', 
      icon: <LayoutGrid className="w-4 h-4 mr-2" />,
      exact: true
    },
    { 
      path: `${basePath}/candidates`, 
      label: 'Candidatos', 
      icon: <Users className="w-4 h-4 mr-2" /> 
    },
    { 
      path: `${basePath}/convocations`, 
      label: 'Convocações', 
      icon: <Calendar className="w-4 h-4 mr-2" /> 
    },
    { 
      path: `${basePath}/documents`, 
      label: 'Documentos', 
      icon: <FileText className="w-4 h-4 mr-2" /> 
    }
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/90 border-b">
      <div className="layout-container">
        <div className="flex h-16 items-center justify-between">
          <Link to={basePath} className="flex items-center gap-2">
            <img 
              src={getCompetitionLogo()} 
              alt={getCompetitionTitle()} 
              className="h-10 w-auto"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span className="text-primary font-semibold text-xl">Enfermeiros</span>
              <span className="text-muted-foreground text-xl ml-1">
                {currentCompetition === 'joinville' ? 'Joinville' : 'Florianópolis'}
              </span>
            </motion.div>
          </Link>
          
          <nav className="flex gap-1 sm:gap-2">
            {navItems.map((item) => {
              const active = isActive(item);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    active 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-primary rounded-lg z-[-1]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
