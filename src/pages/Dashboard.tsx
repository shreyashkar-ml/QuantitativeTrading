
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart3, DollarSign, LineChart, Percent, TrendingDown } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StrategyCard, StrategyResult } from '@/components/StrategyCard';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function Dashboard() {
  const [strategies, setStrategies] = useState<StrategyResult[]>([]);
  const [latestResult, setLatestResult] = useState<StrategyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both data in parallel
        const [strategiesData, latestResultData] = await Promise.all([
          api.getStrategies(),
          api.getLatestResults()
        ]);
        
        setStrategies(strategiesData);
        setLatestResult(latestResultData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch trading data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Find best strategy based on total return
  const bestStrategy = strategies.reduce(
    (best, current) => current.totalReturn > best.totalReturn ? current : best,
    { totalReturn: -Infinity } as StrategyResult
  );
  
  // Find worst strategy based on max drawdown (most negative)
  const worstDrawdown = strategies.reduce(
    (worst, current) => current.maxDrawdown < worst.maxDrawdown ? current : worst,
    { maxDrawdown: 0 } as StrategyResult
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
              <p className="text-muted-foreground">
                View performance metrics for all your algorithmic trading strategies
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </motion.div>

        {loading ? (
          // Loading state
          <div className="glass-card rounded-xl p-16 flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-r-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading trading data...</p>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Best Strategy" 
                value={bestStrategy?.name || 'N/A'}
                trend="positive"
                icon={<ArrowUpRight className="h-4 w-4" />}
                delay={1}
              />
              <StatCard 
                title="Best Return" 
                value={`${bestStrategy?.totalReturn.toFixed(2)}%` || 'N/A'}
                trend="positive"
                icon={<LineChart className="h-4 w-4" />}
                delay={2}
              />
              <StatCard 
                title="Worst Drawdown" 
                value={`${worstDrawdown?.maxDrawdown.toFixed(2)}%` || 'N/A'}
                trend="negative"
                icon={<TrendingDown className="h-4 w-4" />}
                delay={3}
              />
              <StatCard 
                title="Total Strategies" 
                value={strategies.length}
                trend="neutral"
                icon={<BarChart3 className="h-4 w-4" />}
                delay={4}
              />
            </div>

            {/* Latest result highlight */}
            {latestResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-4">Latest Performance</h2>
                <StrategyCard strategy={latestResult} index={0} />
              </motion.div>
            )}

            {/* All strategies */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">All Strategy Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strategies.map((strategy, index) => (
                  <StrategyCard key={strategy.name} strategy={strategy} index={index} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
