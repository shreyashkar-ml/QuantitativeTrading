
import { motion } from 'framer-motion';
import { ArrowDownIcon, ArrowUpIcon, LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCard } from './StatCard';

export interface StrategyResult {
  name: string;
  equity: number;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

interface StrategyCardProps {
  strategy: StrategyResult;
  index: number;
}

export function StrategyCard({ strategy, index }: StrategyCardProps) {
  const isPositiveReturn = strategy.totalReturn >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center",
              isPositiveReturn ? "bg-trading-positive/10" : "bg-trading-negative/10"
            )}>
              <LineChart className={cn(
                "h-5 w-5",
                isPositiveReturn ? "text-trading-positive" : "text-trading-negative"
              )} />
            </div>
            <h2 className="text-xl font-semibold">{strategy.name}</h2>
          </div>
          <div className={cn(
            "flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full",
            isPositiveReturn ? "bg-trading-positive/10 text-trading-positive" : "bg-trading-negative/10 text-trading-negative"
          )}>
            {isPositiveReturn ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
            {strategy.totalReturn.toFixed(2)}%
          </div>
        </div>

        <div className="text-2xl font-bold mb-6">
          ${strategy.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard 
            title="Annualized Return" 
            value={`${strategy.annualizedReturn.toFixed(2)}%`}
            trend={strategy.annualizedReturn >= 0 ? 'positive' : 'negative'}
          />
          <StatCard 
            title="Volatility" 
            value={`${strategy.volatility.toFixed(2)}%`}
            trend="neutral"
          />
          <StatCard 
            title="Sharpe Ratio" 
            value={strategy.sharpeRatio.toFixed(2)}
            trend={strategy.sharpeRatio >= 0.5 ? 'positive' : strategy.sharpeRatio >= 0 ? 'neutral' : 'negative'}
          />
          <StatCard 
            title="Max Drawdown" 
            value={`${strategy.maxDrawdown.toFixed(2)}%`}
            trend="negative"
            className="md:col-span-3"
          />
        </div>
      </div>
    </motion.div>
  );
}
