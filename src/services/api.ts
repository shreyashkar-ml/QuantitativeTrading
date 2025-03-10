
import { StrategyResult } from '@/components/StrategyCard';

// This is a mock service that would be replaced with actual API calls in a real implementation
export const api = {
  getStrategies: async (): Promise<StrategyResult[]> => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on the provided terminal output
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
  },
  
  getLatestResults: async (): Promise<StrategyResult> => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return the best performing strategy as the latest result
    return {
      name: "MeanReversalStrategy", // Best performing strategy based on provided data
      equity: 255261.50,
      totalReturn: 155.26,
      annualizedReturn: 12.62,
      volatility: 20.90,
      sharpeRatio: 0.60,
      maxDrawdown: -39.43,
    };
  }
};
