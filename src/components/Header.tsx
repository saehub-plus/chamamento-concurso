
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <LayoutGrid className="w-4 h-4 mr-2" /> 
    },
    { 
      path: '/candidates', 
      label: 'Candidatos', 
      icon: <Users className="w-4 h-4 mr-2" /> 
    },
    { 
      path: '/convocations', 
      label: 'Convocações', 
      icon: <Calendar className="w-4 h-4 mr-2" /> 
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/90 border-b">
      <div className="layout-container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <span className="text-primary font-semibold text-xl">Enfermeiros</span>
              <span className="text-muted-foreground text-xl ml-1">Joinville</span>
            </motion.div>
          </Link>
          
          <nav className="flex gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {isActive && (
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
