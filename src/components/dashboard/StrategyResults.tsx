
import { motion } from 'framer-motion';
import { StrategyResult } from '@/components/StrategyCard';
import { StatCard } from '@/components/StatCard';

interface StrategyResultsProps {
  strategies: StrategyResult[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function StrategyResults({ strategies, isLoading, onRefresh }: StrategyResultsProps) {
  if (isLoading || !strategies || strategies.length === 0) return null;

  const bestStrategy = strategies.reduce((best, current) => 
    current.annualizedReturn > best.annualizedReturn ? current : best
  );

  return (
    <>
      {bestStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-semibold mb-6">Best Performing Strategy</h2>
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4 text-primary">{bestStrategy.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Return" 
                value={`${bestStrategy.totalReturn.toFixed(2)}%`} 
                trend={bestStrategy.totalReturn > 0 ? 'positive' : 'negative'} 
              />
              <StatCard 
                title="Annualized Return" 
                value={`${bestStrategy.annualizedReturn.toFixed(2)}%`} 
                trend={bestStrategy.annualizedReturn > 0 ? 'positive' : 'negative'} 
              />
              <StatCard 
                title="Sharpe Ratio" 
                value={bestStrategy.sharpeRatio.toFixed(2)} 
                trend={bestStrategy.sharpeRatio > 0.2 ? 'positive' : 'negative'} 
              />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Strategy Comparison</h2>
          <button 
            onClick={onRefresh} 
            className="text-sm text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
        
        <div className="space-y-6">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-medium mb-2 md:mb-0">{strategy.name}</h3>
                <div className="flex items-center space-x-8">
                  <div>
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className={`font-medium ${strategy.totalReturn > 0 ? 'text-trading-positive' : 'text-trading-negative'}`}>
                      {strategy.totalReturn.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sharpe</p>
                    <p className="font-medium">{strategy.sharpeRatio.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Drawdown</p>
                    <p className="font-medium text-trading-negative">{strategy.maxDrawdown.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
