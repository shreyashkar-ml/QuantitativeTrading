from trading_system import TradingSystem
import argparse
from datetime import datetime

def main():
    """
    Main function that processes command line arguments and runs the trading system.
    """
    parser = argparse.ArgumentParser(description='Quantitative Trading System')
    
    # Main command mode (backtest or live)
    parser.add_argument('--mode', choices=['backtest', 'live'], default='live',
                        help='Operating mode: backtest or live trading simulation')
    
    # Common parameters
    parser.add_argument('--tickers', nargs='+', help='List of ticker symbols to use (e.g., AAPL MSFT GOOGL)')
    parser.add_argument('--cash', type=float, default=100000, help='Initial cash amount')
    
    # Backtest parameters
    parser.add_argument('--start-date', default='2015-01-01', help='Start date for backtesting (YYYY-MM-DD)')
    parser.add_argument('--end-date', default='2023-12-31', help='End date for backtesting (YYYY-MM-DD)')
    parser.add_argument('--strategy', help='Specific strategy to run (default: run all)')
    
    args = parser.parse_args()
    
    # Initialize the trading system
    print("Initializing Trading System...")
    trading_system = TradingSystem(
        user_tickers=args.tickers,
        start_date=args.start_date,
        end_date=args.end_date,
        cash=args.cash
    )
    
    if args.mode == 'backtest':
        print(f"Running backtest from {args.start_date} to {args.end_date}")
        
        if args.strategy:
            # Run backtest for a specific strategy
            print(f"Running backtest for {args.strategy} strategy")
            trading_system.run_backtest(args.strategy)
        else:
            # Run backtest for all strategies
            print("Running backtest for all strategies")
            trading_system.run_all_backtests()
            
    elif args.mode == 'live':
        print("Generating live trading recommendations")
        # Get trading recommendations using the best strategy
        trading_system.get_trading_recommendations()
        
if __name__ == "__main__":
    main() 