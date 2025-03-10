
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
      
      // Mock data that simulates what would come from the Python backend
      return [
        {
          name: "MeanReversalStrategy",
          equity: 255261.50,
          totalReturn: 155.26,
          annualizedReturn: 12.62,
          volatility: 20.90,
          sharpeRatio: 0.60,
          maxDrawdown: -39.43,
        },
        {
          name: "PriceRatioMeanStrategy",
          equity: 168163.07,
          totalReturn: 68.16,
          annualizedReturn: 9.38,
          volatility: 26.84,
          sharpeRatio: 0.35,
          maxDrawdown: -63.17,
        },
        {
          name: "MomentumStrategy",
          equity: 74736.92,
          totalReturn: -25.26,
          annualizedReturn: -0.69,
          volatility: 22.57,
          sharpeRatio: -0.03,
          maxDrawdown: -58.11,
        },
        {
          name: "Combined Strategy",
          equity: 83719.00,
          totalReturn: -16.28,
          annualizedReturn: 0.80,
          volatility: 23.60,
          sharpeRatio: 0.03,
          maxDrawdown: -76.78,
        },
        {
          name: "Regime Switching Strategy",
          equity: 151563.95,
          totalReturn: 51.56,
          annualizedReturn: 7.22,
          volatility: 22.76,
          sharpeRatio: 0.32,
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

export default tradingService;
