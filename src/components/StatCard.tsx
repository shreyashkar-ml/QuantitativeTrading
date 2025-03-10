
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  trend = 'neutral', 
  icon, 
  className,
  delay = 0
}: StatCardProps) {
  const trendColor = {
    positive: 'text-trading-positive',
    negative: 'text-trading-negative',
    neutral: 'text-trading-neutral'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "glass-card p-6 rounded-xl shadow-sm",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className={cn("text-2xl font-semibold", trendColor[trend])}>
        {value}
      </div>
    </motion.div>
  );
}
