
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import tradingService, { StrategyRequest } from '@/services/tradingService';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SearchSection } from '@/components/dashboard/SearchSection';
import { WelcomeMessage } from '@/components/dashboard/WelcomeMessage';
import { ErrorDisplay } from '@/components/dashboard/ErrorDisplay';
import { LoadingDisplay } from '@/components/dashboard/LoadingDisplay';
import { StrategyResults } from '@/components/dashboard/StrategyResults';

function Dashboard() {
  const [ticker, setTicker] = useState<string>('');
  
  const [request, setRequest] = useState<StrategyRequest>({ 
    ticker: '',
    startDate: '2020-01-01',
    endDate: new Date().toISOString().split('T')[0],
    initialCapital: 100000
  });

  const { data: strategies, isLoading, error, refetch } = useQuery({
    queryKey: ['strategies', request],
    queryFn: () => tradingService.getStrategies(request),
    enabled: Boolean(request.ticker),
  });

  const handleSearch = (searchTicker: string) => {
    setTicker(searchTicker);
    if (searchTicker) {
      setRequest(prev => ({ ...prev, ticker: searchTicker }));
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <SearchSection onSearch={handleSearch} isLoading={isLoading} />
        
        {!ticker && <WelcomeMessage />}
        <ErrorDisplay error={error as Error} />
        <LoadingDisplay isLoading={isLoading} ticker={ticker} />
        
        {strategies && (
          <StrategyResults 
            strategies={strategies} 
            isLoading={isLoading}
            onRefresh={() => refetch()}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
