
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TickerSearchProps {
  onSearch: (ticker: string) => void;
  isLoading?: boolean;
}

const TickerSearch = ({ onSearch, isLoading = false }: TickerSearchProps) => {
  const [ticker, setTicker] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticker.trim()) {
      toast({
        title: "Ticker required",
        description: "Please enter a valid ticker symbol",
        variant: "destructive",
      });
      return;
    }
    
    onSearch(ticker.trim().toUpperCase());
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Enter ticker symbol (e.g., AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
        >
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-primary border-r-transparent animate-spin"></div>
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default TickerSearch;
