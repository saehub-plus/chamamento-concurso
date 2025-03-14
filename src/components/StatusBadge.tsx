
import { CandidateStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CandidateStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const getStatusConfig = (status: CandidateStatus) => {
    switch (status) {
      case 'classified':
        return {
          label: 'Classificado',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'called':
        return {
          label: 'Convocado',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          textColor: 'text-amber-700 dark:text-amber-300',
          borderColor: 'border-amber-200 dark:border-amber-800'
        };
      case 'withdrawn':
        return {
          label: 'Desistente',
          bgColor: 'bg-gray-50 dark:bg-gray-800/40',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700'
        };
      case 'eliminated':
        return {
          label: 'Eliminado',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          textColor: 'text-red-700 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      case 'appointed':
        return {
          label: 'Nomeado',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800'
        };
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'font-medium rounded-full border inline-flex items-center justify-center transition-all',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
