import pandas as pd
from datetime import datetime
from utils import get_ticker_dfs, get_sp500_data, fetch_date_range
from alphas import MeanReversalAlpha, PriceRatioMeanReversalAlpha, MomentumAlpha, AdaptiveRegimeAlpha
from trader import Trader

class TradingSystem:
    """
    A wrapper class that provides an easy interface to run backtests or get live trading recommendations.
    
    This class encapsulates the functionality of loading data, creating alpha strategies, running backtests,
    and generating trading signals.
    """
    
    def __init__(self, user_tickers=None, start_date='2015-01-01', end_date='2023-12-31', cash=100000):
        """
        Initialize the trading system.
        
        Args:
            user_tickers (list, optional): List of ticker symbols to use. Defaults to None (uses NDXT30).
            start_date (str, optional): The start date for data loading. Defaults to '2015-01-01'.
            end_date (str, optional): The end date for data loading. Defaults to '2023-12-31'.
            cash (int, optional): Initial cash amount for backtests. Defaults to 100000.
        """
        self.start_date, self.end_date = fetch_date_range(start_date, end_date)
        self.cash = cash
        self.sp500_df = get_sp500_data(self.start_date, self.end_date)
        self.tickers, self.dfs = get_ticker_dfs(self.start_date, self.end_date, user_tickers)
        
        if not self.tickers or not self.dfs:
            print("No data available. The system cannot proceed without ticker data.")
            return
            
        # Initialize all alpha strategies
        self.alpha1 = MeanReversalAlpha(self.tickers, self.dfs, self.start_date, self.end_date, name="MeanReversalAlpha")
        self.alpha2 = PriceRatioMeanReversalAlpha(self.tickers, self.dfs, self.start_date, self.end_date, name="PriceRatioMeanAlpha")
        self.alpha3 = MomentumAlpha(self.tickers, self.dfs, self.start_date, self.end_date, name="MomentumAlpha")
        self.regime_alpha = AdaptiveRegimeAlpha(self.tickers, self.dfs, self.start_date, self.end_date, self.sp500_df, name="regime_switching")
        
        # Define available strategies
        self.strategies = {
            "MeanReversalAlpha": [self.alpha1],
            "PriceRatioMeanAlpha": [self.alpha2],
            "MomentumAlpha": [self.alpha3],
            "Combined Alpha": [self.alpha1, self.alpha2, self.alpha3],
            "Regime Switching Alpha": [self.regime_alpha]
        }
        
        # Initialize results storage
        self.results = {}
        self.all_strategy_results = []
        
    def run_all_backtests(self, start_date=None, end_date=None):
        """
        Run backtests for all available strategies.
        
        Args:
            start_date (datetime, optional): Override the start date for backtests. Defaults to None.
            end_date (datetime, optional): Override the end date for backtests. Defaults to None.
            
        Returns:
            dict: A dictionary containing results for all strategies.
        """
        if not self.tickers or not self.dfs:
            print("No data available to proceed with backtest.")
            return None
            
        backtest_start = start_date if start_date is not None else self.start_date
        backtest_end = end_date if end_date is not None else self.end_date
        
        self.results = {}
        self.all_strategy_results = []
        
        for strategy_name, alphas in self.strategies.items():
            print(f"\n=== Running {strategy_name} Backtest ===")
            trader = Trader(self.tickers, self.dfs, backtest_start, backtest_end, self.cash, alphas)
            trader.run_backtest()
            if trader.equity:
                self.results[strategy_name] = trader.get_pnl_stats()
            else:
                self.results[strategy_name] = {"error": "No equity data generated"}
                
        # Format results for display and API
        for strategy, stats in self.results.items():
            strategy_dict = {"strategy_name": strategy}

            print(f"\n=== {strategy} Results ===")
            if "error" in stats:
                print(stats["error"])
                strategy_dict["error"] = stats["error"]
            else:
                final_equity = stats['Equity Curve'].iloc[-1]
                print(f"Final Portfolio Equity: ${final_equity:,.2f}")
                strategy_dict["final_equity"] = float(final_equity)
                print("PnL Statistics:")

                stats_dict = {}
                for key, value in stats.items():
                    if isinstance(value, (int, float)):
                        print(f"{key}: {value:.2f}")
                        stats_dict[key] = float(value)
                    elif key not in ["Daily Returns", "Cumulative Returns", "Equity Curve"]:
                        print(f"{key}: {value}")
                        stats_dict[key] = float(value)

                strategy_dict["statistics"] = stats_dict

            self.all_strategy_results.append(strategy_dict)
            
        return self.all_strategy_results
        
    def get_best_strategy(self):
        """
        Get the name of the strategy with the highest Sharpe ratio.
        
        Returns:
            str: The name of the best strategy.
        """
        if not self.results:
            self.run_all_backtests()
            
        best_strategy_name = max(
            self.strategies.items(), 
            key=lambda x: self.results.get(x[0], {}).get("Sharpe Ratio", -float('inf'))
        )[0]
        
        return best_strategy_name
    
    def run_backtest(self, strategy_name, start_date=None, end_date=None):
        """
        Run a backtest for a specific strategy.
        
        Args:
            strategy_name (str): The name of the strategy to run.
            start_date (datetime, optional): Override the start date. Defaults to None.
            end_date (datetime, optional): Override the end date. Defaults to None.
            
        Returns:
            dict: The backtest results.
        """
        if strategy_name not in self.strategies:
            print(f"Strategy '{strategy_name}' not found. Available strategies: {list(self.strategies.keys())}")
            return None
            
        backtest_start = start_date if start_date is not None else self.start_date
        backtest_end = end_date if end_date is not None else self.end_date
        
        alphas = self.strategies[strategy_name]
        
        print(f"\n=== Running {strategy_name} Backtest ===")
        trader = Trader(self.tickers, self.dfs, backtest_start, backtest_end, self.cash, alphas)
        trader.run_backtest()
        
        if trader.equity:
            results = trader.get_pnl_stats()
            
            print(f"\n=== {strategy_name} Results ===")
            final_equity = results['Equity Curve'].iloc[-1]
            print(f"Final Portfolio Equity: ${final_equity:,.2f}")
            print("PnL Statistics:")
            for key, value in results.items():
                if isinstance(value, (int, float)):
                    print(f"{key}: {value:.2f}")
                elif key not in ["Daily Returns", "Cumulative Returns", "Equity Curve"]:
                    print(f"{key}: {value}")
                    
            return results
        else:
            print("No equity data generated")
            return {"error": "No equity data generated"}
    
    def get_trading_recommendations(self, strategy_name=None, current_date=None):
        """
        Get trading recommendations for today or a specified date.
        
        Args:
            strategy_name (str, optional): Strategy to use. If None, the best strategy will be used.
            current_date (datetime, optional): Date for recommendations. Defaults to today.
            
        Returns:
            dict: Trading recommendations including positions, allocations, etc.
        """
        if not self.tickers or not self.dfs:
            print("No data available to generate recommendations.")
            return None
            
        # If no strategy specified, use the best one based on backtest results
        if strategy_name is None:
            best_strategy_name = self.get_best_strategy()
        else:
            if strategy_name not in self.strategies:
                print(f"Strategy '{strategy_name}' not found. Available strategies: {list(self.strategies.keys())}")
                return None
            best_strategy_name = strategy_name
            
        print(f"Using strategy: {best_strategy_name}")
        best_strategy_alphas = self.strategies[best_strategy_name]
        
        # Create trader instance with the selected strategy
        recommendation_trader = Trader(self.tickers, self.dfs, self.start_date, self.end_date, self.cash, best_strategy_alphas)
        
        # Get trading recommendations
        today_recommendations = recommendation_trader.trade_indicator(current_date)
        
        # Display recommendations
        if "error" in today_recommendations:
            print(f"Error generating recommendations: {today_recommendations['error']}")
            return today_recommendations
        
        print(f"Recommended strategy based on {today_recommendations['best_period']} backtest")
        print(f"Strategy: {today_recommendations['strategy']}")
        print(f"Date: {today_recommendations['date']}")
        print(f"Reference Date (Last Active Trading Day): {today_recommendations['reference_date']}")
        print(f"Sharpe Ratio: {today_recommendations['sharpe_ratio']:.4f}")
        
        print("\nPosition Recommendations:")
        print("=" * 100)
        print(f"{'Ticker':<8} {'Position':<8} {'Units':<8} {'Price':>8} {'Capital ($)':>15} {'Allocation %':>12} {'Alpha Strength':>15} {'Volatility':>10}")
        print("-" * 100)
        
        for position in today_recommendations['positions']:
            ticker = position['ticker']
            pos_type = position['position']
            units = position['units']
            price = position['price']
            capital = position['capital_allocation']
            allocation_pct = position['allocation_percentage']
            alpha = position.get('alpha_strength', 0)
            vol = position.get('volatility', 0)
            
            print(f"{ticker:<8} {pos_type:<8} {units:<8} ${price:>7.2f} ${capital:>14.2f} {allocation_pct:>12} {alpha:>15.4f} {vol:>10.4f}")
        
        print("-" * 100)
        print(f"Cash Position: {today_recommendations['cash_position']}")
        
        # Also create a summary dataframe that could be used for front-end display
        position_summary = pd.DataFrame(today_recommendations['positions'])
        if not position_summary.empty:
            position_summary['price'] = position_summary['price'].map('${:.2f}'.format)
            position_summary['capital_allocation'] = position_summary['capital_allocation'].map('${:.2f}'.format)
            # Print first few rows as example
            print("\nDataFrame format (for front-end integration):")
            print(position_summary.head())
            
        # Return the raw recommendations
        return today_recommendations
        
# Example usage in a script:
if __name__ == "__main__":
    # Initialize the trading system with default settings (NDXT30 tickers)
    trading_system = TradingSystem()
    
    # Option 1: Run backtests for all strategies
    # trading_system.run_all_backtests()
    
    # Option 2: Run a backtest for a specific strategy
    # trading_system.run_backtest("MeanReversalAlpha")
    
    # Option 3: Get today's trading recommendations using the best strategy
    trading_system.get_trading_recommendations()
    
    # Option 4: Get recommendations for a specific strategy
    # trading_system.get_trading_recommendations(strategy_name="Regime Switching Alpha") 