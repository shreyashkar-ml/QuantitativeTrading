
import { StrategyResult } from '@/components/StrategyCard';

// This interface defines what a user would send to request strategy calculations
export interface StrategyRequest {
  ticker: string;
  startDate?: string;
  endDate?: string;
  initialCapital?: number;
}

// In a real deployment, this service would make HTTP requests to an API endpoint
// that runs the Python code on the server rather than the client
const tradingService = {
  // Get all strategies for a specific ticker
  getStrategies: async (request: StrategyRequest): Promise<StrategyResult[]> => {
    try {
      // In a real environment, this would be a fetch request to your backend API
      // Example: return await fetch(`/api/strategies?ticker=${request.ticker}`)
      
      // For demo purposes, we'll simulate an API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate different results based on the ticker
      const tickerMultiplier = getMultiplierForTicker(request.ticker);
      
      // Mock data that simulates what would come from the Python backend
      return [
        {
          name: "MeanReversalStrategy",
          equity: 255261.50 * tickerMultiplier,
          totalReturn: 155.26 * tickerMultiplier,
          annualizedReturn: 12.62 * tickerMultiplier,
          volatility: 20.90,
          sharpeRatio: 0.60 * tickerMultiplier,
          maxDrawdown: -39.43,
        },
        {
          name: "PriceRatioMeanStrategy",
          equity: 168163.07 * tickerMultiplier,
          totalReturn: 68.16 * tickerMultiplier,
          annualizedReturn: 9.38 * tickerMultiplier,
          volatility: 26.84,
          sharpeRatio: 0.35 * tickerMultiplier,
          maxDrawdown: -63.17,
        },
        {
          name: "MomentumStrategy",
          equity: 74736.92 * tickerMultiplier,
          totalReturn: -25.26 * (tickerMultiplier < 1 ? 1/tickerMultiplier : tickerMultiplier),
          annualizedReturn: -0.69 * (tickerMultiplier < 1 ? 1/tickerMultiplier : tickerMultiplier),
          volatility: 22.57,
          sharpeRatio: -0.03 * (tickerMultiplier < 1 ? 1/tickerMultiplier : tickerMultiplier),
          maxDrawdown: -58.11,
        },
        {
          name: "Combined Strategy",
          equity: 83719.00 * tickerMultiplier,
          totalReturn: -16.28 * (tickerMultiplier < 1 ? 1/tickerMultiplier : tickerMultiplier),
          annualizedReturn: 0.80 * tickerMultiplier,
          volatility: 23.60,
          sharpeRatio: 0.03 * tickerMultiplier,
          maxDrawdown: -76.78,
        },
        {
          name: "Regime Switching Strategy",
          equity: 151563.95 * tickerMultiplier,
          totalReturn: 51.56 * tickerMultiplier,
          annualizedReturn: 7.22 * tickerMultiplier,
          volatility: 22.76,
          sharpeRatio: 0.32 * tickerMultiplier,
          maxDrawdown: -49.59,
        },
      ];
    } catch (error) {
      console.error("Error fetching strategies:", error);
      throw error;
    }
  },
  
  // Get a specific strategy result
  getStrategyResult: async (strategyName: string, request: StrategyRequest): Promise<StrategyResult> => {
    try {
      // In a real environment, this would be a fetch request to your backend API
      // Example: return await fetch(`/api/strategy/${strategyName}?ticker=${request.ticker}`)
      
      // For demo purposes, we'll simulate an API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock return for a specific strategy
      const allStrategies = await tradingService.getStrategies(request);
      const strategy = allStrategies.find(s => s.name === strategyName);
      
      if (!strategy) {
        throw new Error(`Strategy ${strategyName} not found`);
      }
      
      return strategy;
    } catch (error) {
      console.error(`Error fetching ${strategyName}:`, error);
      throw error;
    }
  },
};

// Helper function to generate different results for different tickers
function getMultiplierForTicker(ticker: string): number {
  // Map common tickers to specific multipliers
  const multipliers: Record<string, number> = {
    'AAPL': 1.2,
    'MSFT': 1.3,
    'GOOGL': 1.1,
    'AMZN': 0.9,
    'TSLA': 1.5,
    'META': 0.85,
    'NVDA': 1.6,
    'JPM': 0.95,
    'V': 1.05,
    'WMT': 0.8,
  };
  
  // Return the specific multiplier or a random one between 0.7 and 1.3
  return multipliers[ticker] || (0.7 + Math.random() * 0.6);
}

export default tradingService;
