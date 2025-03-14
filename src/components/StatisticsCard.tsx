
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { StatusCount } from '@/types';
import { scaleVariants } from '@/utils/animations';

interface StatisticsCardProps {
  statusCounts: StatusCount;
  total: number;
}

export function StatisticsCard({ statusCounts, total }: StatisticsCardProps) {
  const statuses = [
    {
      type: 'classified' as const,
      label: 'Classificados',
      count: statusCounts.classified,
      percentage: Math.round((statusCounts.classified / total) * 100) || 0
    },
    {
      type: 'called' as const,
      label: 'Convocados',
      count: statusCounts.called,
      percentage: Math.round((statusCounts.called / total) * 100) || 0
    },
    {
      type: 'appointed' as const,
      label: 'Nomeados',
      count: statusCounts.appointed,
      percentage: Math.round((statusCounts.appointed / total) * 100) || 0
    },
    {
      type: 'withdrawn' as const,
      label: 'Desistentes',
      count: statusCounts.withdrawn,
      percentage: Math.round((statusCounts.withdrawn / total) * 100) || 0
    },
    {
      type: 'eliminated' as const,
      label: 'Eliminados',
      count: statusCounts.eliminated,
      percentage: Math.round((statusCounts.eliminated / total) * 100) || 0
    }
  ];

  return (
    <motion.div
      variants={scaleVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Resumo por Status</h3>
          
          <div className="space-y-6">
            {statuses.map((status) => (
              <div key={status.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status.type} size="sm" />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <span className="text-sm font-medium">{status.count}</span>
                </div>
                
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${status.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="text-right text-xs text-muted-foreground">
                  {status.percentage}% do total
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total de Candidatos</span>
              <span className="font-bold text-lg">{total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
