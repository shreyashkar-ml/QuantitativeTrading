
import { useState, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sp500Tickers, sp500CompanyNames } from '@/data/sp500Tickers';

interface TickerSearchProps {
  onSearch: (ticker: string) => void;
  isLoading?: boolean;
}

const TickerSearch = ({ onSearch, isLoading = false }: TickerSearchProps) => {
  const [ticker, setTicker] = useState('');
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (ticker.trim()) {
      const filtered = sp500Tickers.filter(t => 
        t.toLowerCase().includes(ticker.toLowerCase()) ||
        sp500CompanyNames[t]?.toLowerCase().includes(ticker.toLowerCase())
      ).slice(0, 10);
      setFilteredTickers(filtered);
    } else {
      setFilteredTickers(sp500Tickers.slice(0, 10));
    }
  }, [ticker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTickers.length === 0 && !ticker.trim()) {
      toast({
        title: "Ticker required",
        description: "Please select at least one ticker symbol",
        variant: "destructive",
      });
      return;
    }
    
    if (ticker.trim() && !selectedTickers.includes(ticker.trim().toUpperCase())) {
      const newTickers = [...selectedTickers, ticker.trim().toUpperCase()];
      setSelectedTickers(newTickers);
      setTicker('');
      onSearch(ticker.trim().toUpperCase());
    } else if (selectedTickers.length > 0) {
      onSearch(selectedTickers[0]);
    }
  };

  const addTicker = (newTicker: string) => {
    if (!selectedTickers.includes(newTicker)) {
      const newTickers = [...selectedTickers, newTicker];
      setSelectedTickers(newTickers);
      setTicker('');
      setShowDropdown(false);
      onSearch(newTicker);
    }
  };

  const removeTicker = (tickerToRemove: string) => {
    const newTickers = selectedTickers.filter(t => t !== tickerToRemove);
    setSelectedTickers(newTickers);
    
    if (newTickers.length === 0) {
      onSearch('');
    } else {
      onSearch(newTickers[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedTickers.map(t => (
          <div 
            key={t} 
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md"
          >
            <span>{t}</span>
            <button 
              type="button" 
              onClick={() => removeTicker(t)}
              className="text-primary hover:text-primary/70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter ticker symbol (e.g., AAPL)"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full h-12 px-4 pr-12 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-4 bg-primary text-white rounded-r-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-r-transparent animate-spin"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </form>
        
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredTickers.length > 0 ? (
              filteredTickers.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTicker(t)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <span className="font-medium">{t}</span>
                  <span className="text-sm text-muted-foreground truncate ml-2">{sp500CompanyNames[t] || ''}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-muted-foreground">No matching tickers found</div>
            )}
          </div>
        )}
      </div>
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default TickerSearch;
