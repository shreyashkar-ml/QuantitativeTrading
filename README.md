# Quantitative Trading System

A flexible and powerful quantitative trading system that uses multiple alpha strategies to generate trading signals. The system can either run backtests to evaluate strategy performance or generate live trading recommendations.

## Features

- Multiple alpha strategies including Mean Reversion, Price Ratio Mean Reversion, Momentum, and Adaptive Regime Switching
- Dynamic capital allocation based on alpha signal strength and volatility
- Detailed performance metrics for backtests
- Command-line interface for easy use
- Interactive CLI with colorful output and step-by-step guidance
- Customizable ticker selection
- Comprehensive trading recommendations with position sizing
- Visualization of equity curves and drawdowns

## Installation

1. Clone this repository:
```
git clone https://github.com/yourusername/QuantitativeTrading.git
cd QuantitativeTrading
```

2. Install dependencies:
```
pip install -r requirements.txt
```

## Prerequisites
- Python 3.8+
- Git (for cloning the repository)
- Internet connection (for downloading financial data)

## Usage

The system can be used in three ways:

1. Interactive Command Line Interface
2. Standard Command Line Interface
3. As a Python module in your own scripts

### Interactive Command Line Interface

The interactive CLI provides a user-friendly way to use the system with colorful output and step-by-step guidance.

```
python interactive_cli.py
```

or

```
python interactive_cli.py --interactive
```

The interactive mode will guide you through:
- Selecting backtest or live trading mode
- Choosing your own tickers or using the default NDXT30
- Setting initial cash amount
- Specifying date ranges for backtests
- Selecting strategies to run
- Viewing results in colorful tables
- Generating visualizations

### Standard Command Line Interface

The system can be operated through the command line with various options:

```
python interactive_cli.py [--mode {backtest,live}] [--tickers TICKER1 TICKER2 ...] [--cash AMOUNT] 
               [--start-date START_DATE] [--end-date END_DATE] [--strategy STRATEGY_NAME] [--visualize]
```

or (with the older interface):

```
python main.py [--mode {backtest,live}] [--tickers TICKER1 TICKER2 ...] [--cash AMOUNT] 
               [--start-date START_DATE] [--end-date END_DATE] [--strategy STRATEGY_NAME]
```

#### Parameters:

- `--mode`: Operation mode, either `backtest` or `live` (default: `live`)
- `--tickers`: List of ticker symbols to use (optional, defaults to NDXT30 tickers if available)
- `--cash`: Initial cash amount for backtests (default: 100000)
- `--start-date`: Start date for backtesting in YYYY-MM-DD format (default: 2015-01-01)
- `--end-date`: End date for backtesting in YYYY-MM-DD format (default: 2023-12-31)
- `--strategy`: Specific strategy to run (optional, runs all strategies by default)
- `--visualize`: Generate and save visualization plots for backtest results

### Examples

#### Running interactive mode

```
python interactive_cli.py
```

#### Running a backtest for all strategies from 2018 to 2022

```
python interactive_cli.py --mode backtest --start-date 2018-01-01 --end-date 2022-12-31
```

#### Running a backtest for a specific strategy with visualizations

```
python interactive_cli.py --mode backtest --strategy "MeanReversalAlpha" --start-date 2019-01-01 --end-date 2023-12-31 --visualize
```

#### Getting today's trading recommendations using custom tickers

```
python interactive_cli.py --mode live --tickers AAPL MSFT GOOGL META AMZN TSLA
```

### Using as a Python Package

You can also import and use the `TradingSystem` class in your own Python scripts:

```python
from trading_system import TradingSystem

# Initialize with default settings
ts = TradingSystem()

# Initialize with custom settings
custom_ts = TradingSystem(
    user_tickers=["AAPL", "MSFT", "GOOGL", "META", "AMZN"],
    start_date="2020-01-01",
    end_date="2023-12-31",
    cash=200000
)

# Run all backtests
results = ts.run_all_backtests()

# Run a specific backtest
ts.run_backtest("MeanReversalAlpha")

# Get today's trading recommendations
recommendations = ts.get_trading_recommendations()

# Get recommendations for a specific strategy
specific_recommendations = ts.get_trading_recommendations(strategy_name="Regime Switching Alpha")
```

## Available Strategies

- **MeanReversalAlpha**: Mean reversion strategy that buys underperforming stocks and sells outperforming ones
- **PriceRatioMeanAlpha**: Uses price ratio to identify mean reversion opportunities
- **MomentumAlpha**: Follows price trends by buying recent winners and selling recent losers
- **Combined Alpha**: A combination of all three basic strategies
- **Regime Switching Alpha**: Adaptively switches between strategies based on market conditions

## Performance Metrics

The system reports the following performance metrics for each backtest:

- Total Return (%)
- Annualized Return (%)
- Annualized Volatility (%)
- Sharpe Ratio
- Maximum Drawdown (%)

## Trading Recommendations

For live trading mode, the system provides:

- Recommended positions (LONG/SHORT)
- Number of units to buy/sell
- Capital allocation for each position
- Allocation percentage
- Alpha signal strength
- Stock volatility
- Cash position percentage

## Visualization
The system can generate visualizations of backtest results:
- Equity curves showing portfolio growth over time
- Drawdown charts showing periods of decline from peaks
- Performance metrics tables

You can generate visualizations in three ways:
1. Using the `--visualize` flag in the command-line interface
2. Selecting "Yes" when prompted in interactive mode
3. Using the plotting functions in your own Python scripts (see `example_usage.py`)

See the `example_usage.py` script for examples of how to create these visualizations in your own code.

## Advanced Usage

### Custom Alpha Strategies

You can create custom alpha strategies by extending the base Alpha class. See the existing alpha implementations in the `alphas.py` file for examples.

### Custom Data Sources

By default, the system uses pickle files to load historical data. You can modify the `utils.py` file to add support for other data sources, such as APIs or CSV files.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

**Note:** On first run, the system will download financial data from Yahoo Finance, which may take several minutes depending on your internet connection. 
