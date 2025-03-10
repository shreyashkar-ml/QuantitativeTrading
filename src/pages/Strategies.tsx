
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowUpDown, LineChart, Search } from 'lucide-react';
import { StrategyResult } from '@/components/StrategyCard';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Strategies() {
  const [strategies, setStrategies] = useState<StrategyResult[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<StrategyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StrategyResult,
    direction: 'asc' | 'desc'
  }>({
    key: 'totalReturn',
    direction: 'desc'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const strategiesData = await api.getStrategies();
        setStrategies(strategiesData);
        setFilteredStrategies(strategiesData);
      } catch (error) {
        console.error('Error fetching strategies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch strategy data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    // Apply search filter
    const filtered = strategies.filter(strategy => 
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredStrategies(sorted);
  }, [searchQuery, strategies, sortConfig]);

  const handleSort = (key: keyof StrategyResult) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

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
          <h1 className="text-3xl font-bold mb-2">Trading Strategies</h1>
          <p className="text-muted-foreground">
            Detailed view of all your algorithmic trading strategies and performance metrics
          </p>
        </motion.div>

        {/* Search and filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </motion.div>

        {loading ? (
          // Loading state
          <div className="glass-card rounded-xl p-16 flex flex-col items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-r-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading strategy data...</p>
          </div>
        ) : filteredStrategies.length === 0 ? (
          // No results state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No strategies found</h3>
            <p className="text-muted-foreground">
              No strategies match your search criteria. Try adjusting your search.
            </p>
          </motion.div>
        ) : (
          // Results table
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left font-medium">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort('name')}
                      >
                        <span>Strategy</span>
                        {sortConfig.key === 'name' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      <button 
                        className="flex items-center justify-end space-x-1 ml-auto"
                        onClick={() => handleSort('equity')}
                      >
                        <span>Final Equity</span>
                        {sortConfig.key === 'equity' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      <button 
                        className="flex items-center justify-end space-x-1 ml-auto"
                        onClick={() => handleSort('totalReturn')}
                      >
                        <span>Total Return</span>
                        {sortConfig.key === 'totalReturn' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      <button 
                        className="flex items-center justify-end space-x-1 ml-auto"
                        onClick={() => handleSort('annualizedReturn')}
                      >
                        <span>Ann. Return</span>
                        {sortConfig.key === 'annualizedReturn' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      <button 
                        className="flex items-center justify-end space-x-1 ml-auto"
                        onClick={() => handleSort('volatility')}
                      >
                        <span>Volatility</span>
                        {sortConfig.key === 'volatility' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      <button 
                        className="flex items-center justify-end space-x-1 ml-auto"
                        onClick={() => handleSort('sharpeRatio')}
                      >
                        <span>Sharpe</span>
                        {sortConfig.key === 'sharpeRatio' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-right font-medium">
                      <button 
                        className="flex items-center justify-end space-x-1 ml-auto"
                        onClick={() => handleSort('maxDrawdown')}
                      >
                        <span>Max DD</span>
                        {sortConfig.key === 'maxDrawdown' && (
                          <ArrowUpDown className={cn(
                            "h-4 w-4 ml-1",
                            sortConfig.direction === 'asc' ? "rotate-180" : ""
                          )} />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStrategies.map((strategy, index) => (
                    <motion.tr
                      key={strategy.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/20 transition-colors",
                        index % 2 === 0 ? "bg-background/50" : "bg-background"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <LineChart className={cn(
                            "h-4 w-4",
                            strategy.totalReturn >= 0 ? "text-trading-positive" : "text-trading-negative"
                          )} />
                          <span className="font-medium">{strategy.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${strategy.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right font-medium",
                        strategy.totalReturn >= 0 ? "text-trading-positive" : "text-trading-negative"
                      )}>
                        {strategy.totalReturn.toFixed(2)}%
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right",
                        strategy.annualizedReturn >= 0 ? "text-trading-positive" : "text-trading-negative"
                      )}>
                        {strategy.annualizedReturn.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        {strategy.volatility.toFixed(2)}%
                      </td>
                      <td className={cn(
                        "px-6 py-4 text-right",
                        strategy.sharpeRatio >= 0.5 ? "text-trading-positive" : 
                        strategy.sharpeRatio >= 0 ? "text-trading-neutral" : "text-trading-negative"
                      )}>
                        {strategy.sharpeRatio.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-trading-negative">
                        {strategy.maxDrawdown.toFixed(2)}%
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Strategies;
