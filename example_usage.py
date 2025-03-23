#!/usr/bin/env python3
"""
Example Usage of the Quantitative Trading System

This script demonstrates how to use the TradingSystem class as a Python module
in your own scripts or notebooks.
"""
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from trading_system import TradingSystem

# Set display options for pandas DataFrames
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)
pd.set_option('display.float_format', '{:.2f}'.format)

def plot_equity_curves(results_dict):
    """Plot equity curves for multiple strategies."""
    plt.figure(figsize=(12, 8))
    
    for strategy_name, stats in results_dict.items():
        if 'error' not in stats and 'Equity Curve' in stats:
            equity_curve = stats['Equity Curve']
            plt.plot(equity_curve.index, equity_curve.values, label=strategy_name)
    
    plt.title('Strategy Equity Curves', fontsize=14)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Portfolio Value ($)', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig('equity_curves.png')
    print("Equity curves plot saved as 'equity_curves.png'")

def plot_drawdowns(results_dict):
    """Plot drawdowns for multiple strategies."""
    plt.figure(figsize=(12, 8))
    
    for strategy_name, stats in results_dict.items():
        if 'error' not in stats and 'Equity Curve' in stats:
            equity_curve = stats['Equity Curve']
            rolling_max = equity_curve.cummax()
            drawdowns = (equity_curve - rolling_max) / rolling_max * 100
            plt.plot(drawdowns.index, drawdowns.values, label=strategy_name)
    
    plt.title('Strategy Drawdowns', fontsize=14)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Drawdown (%)', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    plt.savefig('drawdowns.png')
    print("Drawdowns plot saved as 'drawdowns.png'")

def show_backtest_results(results_dict):
    """Display backtest results in a formatted table."""
    results_data = []
    
    for strategy_name, stats in results_dict.items():
        if 'error' in stats:
            continue
            
        results_data.append({
            'Strategy': strategy_name,
            'Final Equity': f"${stats['Equity Curve'].iloc[-1]:,.2f}",
            'Total Return (%)': f"{stats['Total Return (%)']:.2f}%",
            'Annual Return (%)': f"{stats['Annualized Return (%)']:.2f}%",
            'Volatility (%)': f"{stats['Annualized Volatility (%)']:.2f}%",
            'Sharpe Ratio': f"{stats['Sharpe Ratio']:.2f}",
            'Max Drawdown (%)': f"{stats['Max Drawdown (%)']:.2f}%"
        })
    
    return pd.DataFrame(results_data).set_index('Strategy')

# Example 1: Basic initialization and running all backtests
print("Example 1: Running backtests for all strategies with default settings")
print("-" * 80)

ts = TradingSystem()
results = ts.run_all_backtests()

print("\nBacktest Results Summary:")
print(show_backtest_results(ts.results))

# Generate and save plots
plot_equity_curves(ts.results)
plot_drawdowns(ts.results)

# Example 2: Running a specific strategy with custom settings
print("\n\nExample 2: Running a single strategy with custom settings")
print("-" * 80)

custom_ts = TradingSystem(
    user_tickers=["AAPL", "MSFT", "GOOGL", "META", "AMZN", "TSLA", "NVDA"],
    start_date="2020-01-01",
    end_date="2022-12-31",
    cash=200000
)

# Run a specific backtest
mean_reversal_results = custom_ts.run_backtest("MeanReversalAlpha")

# Example 3: Getting trading recommendations
print("\n\nExample 3: Getting trading recommendations")
print("-" * 80)

# Get trading recommendations using the best strategy
recommendations = ts.get_trading_recommendations()

# Convert positions to DataFrame for analysis
if 'positions' in recommendations and recommendations['positions']:
    positions_df = pd.DataFrame(recommendations['positions'])
    
    # Group by position type and calculate statistics
    position_summary = positions_df.groupby('position').agg({
        'capital_allocation': ['sum', 'mean'],
        'alpha_strength': ['mean', 'min', 'max'],
        'volatility': ['mean', 'min', 'max']
    })
    
    # Calculate percent of portfolio by position type
    total_allocation = positions_df['capital_allocation'].sum()
    for position_type in position_summary.index:
        position_pct = positions_df[positions_df['position'] == position_type]['capital_allocation'].sum() / total_allocation * 100
        print(f"{position_type} positions: {position_pct:.2f}% of portfolio")
    
    print("\nPosition Summary Statistics:")
    print(position_summary)
    
    # Show top 3 strongest alpha signals (absolute value)
    positions_df['abs_alpha'] = positions_df['alpha_strength'].abs()
    top_signals = positions_df.sort_values('abs_alpha', ascending=False).head(3)
    
    print("\nTop 3 strongest alpha signals:")
    for _, row in top_signals.iterrows():
        print(f"{row['ticker']}: {row['position']} with alpha strength {row['alpha_strength']:.4f}")

# Save recommendation data for later use
with open('latest_recommendations.txt', 'w') as f:
    f.write(f"Trading Recommendations generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"Strategy: {recommendations['strategy']}\n")
    f.write(f"Reference Date: {recommendations['reference_date']}\n")
    f.write(f"Cash Position: {recommendations['cash_position']}\n\n")
    
    f.write("Position Recommendations:\n")
    f.write("-" * 80 + "\n")
    f.write(f"{'Ticker':<8} {'Position':<8} {'Units':<8} {'Price':>8} {'Capital ($)':>15} {'Allocation %':>12}\n")
    f.write("-" * 80 + "\n")
    
    for position in recommendations['positions']:
        ticker = position['ticker']
        pos_type = position['position']
        units = position['units']
        price = position['price']
        capital = position['capital_allocation']
        allocation_pct = position['allocation_percentage']
        
        f.write(f"{ticker:<8} {pos_type:<8} {units:<8} ${price:>7.2f} ${capital:>14.2f} {allocation_pct:>12}\n")

print("\nTrading recommendations saved to 'latest_recommendations.txt'")

print("\nScript execution complete!")

if __name__ == "__main__":
    print("\nNote: If you're running this in a Jupyter notebook, you can visualize the results directly")
    print("without saving to files, and you can modify the code to explore different aspects of the")
    print("system's capabilities.") 