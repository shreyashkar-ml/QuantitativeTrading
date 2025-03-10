
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/StatCard';
import TickerSearch from '@/components/TickerSearch';
import tradingService, { StrategyRequest } from '@/services/tradingService';
import { StrategyResult } from '@/components/StrategyCard';
import { useDarkMode } from '@/providers/DarkModeProvider';

function Dashboard() {
  const [ticker, setTicker] = useState<string>('');
  const { darkMode } = useDarkMode();
  
  // Default request with no ticker
  const [request, setRequest] = useState<StrategyRequest>({ 
    ticker: '',
    startDate: '2020-01-01',
    endDate: new Date().toISOString().split('T')[0],
    initialCapital: 100000
  });

  // Query for fetching strategies
  const { data: strategies, isLoading, error, refetch } = useQuery({
    queryKey: ['strategies', request],
    queryFn: () => tradingService.getStrategies(request),
    enabled: Boolean(request.ticker), // Only run the query if there's a ticker
  });

  // Handle ticker search
  const handleSearch = (searchTicker: string) => {
    setTicker(searchTicker);
    setRequest(prev => ({ ...prev, ticker: searchTicker }));
  };

  // Find the best performing strategy
  const getBestStrategy = (): StrategyResult | undefined => {
    if (!strategies || strategies.length === 0) return undefined;
    
    return strategies.reduce((best, current) => 
      current.annualizedReturn > best.annualizedReturn ? current : best
    );
  };

  const bestStrategy = getBestStrategy();

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold mb-3">Algorithmic Trading Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze and compare different trading strategies with real-time performance metrics
          </p>
        </motion.div>

        {/* Ticker search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <TickerSearch onSearch={handleSearch} isLoading={isLoading} />
        </motion.div>

        {/* Display welcome message if no ticker has been searched */}
        {!ticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-semibold mb-4">Welcome to AlgoTrader</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enter a ticker symbol above to analyze trading strategies and view performance metrics.
            </p>
          </motion.div>
        )}

        {/* Display error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-8 p-4 bg-destructive/10 text-destructive rounded-lg max-w-xl mx-auto text-center"
          >
            <p>An error occurred while fetching strategy data. Please try again.</p>
          </motion.div>
        )}

        {/* Display loading state */}
        {isLoading && ticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="h-12 w-12 rounded-full border-4 border-primary border-r-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Calculating strategies for {ticker}...</p>
          </motion.div>
        )}

        {/* Display results if available */}
        {strategies && strategies.length > 0 && !isLoading && (
          <>
            {/* Best strategy card */}
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

            {/* Strategy comparison section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Strategy Comparison</h2>
                <button 
                  onClick={() => refetch()} 
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
        )}
      </div>
    </div>
  );
}

export default Dashboard;
