#!/usr/bin/env python3
import sys
import argparse
from datetime import datetime
import os
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich import box
from rich.traceback import install
from trading_system import TradingSystem
import matplotlib.pyplot as plt

# Install rich traceback handler
install()

# Initialize rich console
console = Console()

def plot_equity_curves(results_dict, output_file='equity_curves.png'):
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
    plt.savefig(output_file)
    console.print(f"[green]Equity curves plot saved as '{output_file}'[/green]")

def plot_drawdowns(results_dict, output_file='drawdowns.png'):
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
    plt.savefig(output_file)
    console.print(f"[green]Drawdowns plot saved as '{output_file}'[/green]")

def print_header():
    """Display a styled header for the application."""
    header_text = Text("Quantitative Trading System", style="bold cyan")
    header_text.append("\nAn interactive trading system with multiple alpha strategies", style="italic yellow")
    console.print(Panel(header_text, box=box.DOUBLE))

def print_strategies():
    """Display the available strategies in a table."""
    table = Table(title="Available Strategies", box=box.SIMPLE)
    table.add_column("Strategy", style="cyan", no_wrap=True)
    table.add_column("Description", style="green")
    
    table.add_row("MeanReversalAlpha", "Mean reversion strategy that buys underperforming stocks and sells outperforming ones")
    table.add_row("PriceRatioMeanAlpha", "Uses price ratio to identify mean reversion opportunities")
    table.add_row("MomentumAlpha", "Follows price trends by buying recent winners and selling recent losers")
    table.add_row("Combined Alpha", "A combination of all three basic strategies")
    table.add_row("Regime Switching Alpha", "Adaptively switches between strategies based on market conditions")
    
    console.print(table)

def print_results_table(results):
    """Display backtest results in a styled table."""
    table = Table(title="Backtest Results", box=box.SIMPLE)
    table.add_column("Strategy", style="cyan", no_wrap=True)
    table.add_column("Final Equity", style="green")
    table.add_column("Total Return", style="bold green")
    table.add_column("Annual Return", style="green")
    table.add_column("Sharpe Ratio", style="yellow")
    table.add_column("Max Drawdown", style="red")
    
    for result in results:
        strategy_name = result["strategy_name"]
        if "error" in result:
            table.add_row(
                strategy_name,
                "Error",
                "Error",
                "Error",
                "Error",
                "Error"
            )
        else:
            statistics = result["statistics"]
            table.add_row(
                strategy_name,
                f"${result['final_equity']:,.2f}",
                f"{statistics['Total Return (%)']:.2f}%",
                f"{statistics['Annualized Return (%)']:.2f}%",
                f"{statistics['Sharpe Ratio']:.2f}",
                f"{statistics['Max Drawdown (%)']:.2f}%"
            )
    
    console.print(table)

def print_recommendations(recommendations):
    """Display trading recommendations in a styled table."""
    if not recommendations or "error" in recommendations:
        console.print("[bold red]Error generating recommendations[/bold red]")
        if "error" in recommendations:
            console.print(f"[red]{recommendations['error']}[/red]")
        return
    
    # Strategy info
    strategy_info = Text()
    strategy_info.append(f"Strategy: ", style="bold")
    strategy_info.append(f"{recommendations['strategy']}", style="cyan")
    strategy_info.append(f"\nReference Date: ", style="bold")
    strategy_info.append(f"{recommendations['reference_date']}", style="yellow")
    strategy_info.append(f"\nSharpe Ratio: ", style="bold")
    strategy_info.append(f"{recommendations['sharpe_ratio']:.4f}", style="green")
    strategy_info.append(f"\nCash Position: ", style="bold")
    strategy_info.append(f"{recommendations['cash_position']}", style="blue")
    
    console.print(Panel(strategy_info, title="Trading Recommendations", box=box.SIMPLE))
    
    # Positions table
    positions = recommendations['positions']
    if not positions:
        console.print("[yellow]No positions recommended.[/yellow]")
        return
    
    table = Table(box=box.SIMPLE)
    table.add_column("Ticker", style="cyan", no_wrap=True)
    table.add_column("Position", style="bold")
    table.add_column("Units", style="blue")
    table.add_column("Price", style="green")
    table.add_column("Capital", style="yellow")
    table.add_column("Allocation %", style="magenta")
    table.add_column("Alpha", style="blue")
    table.add_column("Volatility", style="red")
    
    for position in positions:
        position_style = "green" if position['position'] == "LONG" else "red"
        
        table.add_row(
            position['ticker'],
            f"[{position_style}]{position['position']}[/{position_style}]",
            str(position['units']),
            f"${position['price']:.2f}",
            f"${position['capital_allocation']:.2f}",
            position['allocation_percentage'],
            f"{position['alpha_strength']:.4f}",
            f"{position['volatility']:.4f}"
        )
    
    console.print(table)

def interactive_mode():
    """Run the interactive CLI mode."""
    print_header()
    
    # Mode selection
    console.print("[bold]Select operating mode:[/bold]")
    console.print("1. [cyan]Backtest[/cyan] - Run historical backtests of trading strategies")
    console.print("2. [green]Live Trading[/green] - Generate trading recommendations for today")
    
    mode_choice = Prompt.ask("Enter your choice", choices=["1", "2"], default="2")
    mode = "backtest" if mode_choice == "1" else "live"
    
    # Get tickers
    use_custom_tickers = Confirm.ask("Do you want to use custom ticker symbols?", default=False)
    tickers = None
    if use_custom_tickers:
        ticker_input = Prompt.ask("Enter ticker symbols separated by spaces (e.g., AAPL MSFT GOOGL)")
        tickers = ticker_input.split()
        console.print(f"Using tickers: [bold cyan]{' '.join(tickers)}[/bold cyan]")
    else:
        console.print("[yellow]Using default NDXT30 tickers[/yellow]")
    
    # Get cash amount
    cash = float(Prompt.ask("Enter initial cash amount", default="100000"))
    
    # Date range (for backtest)
    start_date = "2015-01-01"
    end_date = "2023-12-31"
    
    if mode == "backtest":
        start_date = Prompt.ask("Enter start date (YYYY-MM-DD)", default=start_date)
        end_date = Prompt.ask("Enter end date (YYYY-MM-DD)", default=end_date)
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold green]Initializing trading system...[/bold green]"),
        transient=True,
    ) as progress:
        progress.add_task("init", total=None)  # Indeterminate progress
        trading_system = TradingSystem(
            user_tickers=tickers,
            start_date=start_date,
            end_date=end_date,
            cash=cash
        )
    
    if mode == "backtest":
        # Strategy selection
        print_strategies()
        run_all = Confirm.ask("Run all strategies?", default=True)
        
        strategy_name = None
        if not run_all:
            strategies = list(trading_system.strategies.keys())
            strategy_idx = int(Prompt.ask(
                "Select strategy by number", 
                choices=[str(i+1) for i in range(len(strategies))],
                default="1"
            ))
            strategy_name = strategies[strategy_idx-1]
            console.print(f"Selected strategy: [bold cyan]{strategy_name}[/bold cyan]")
        
        # Visualization option
        create_visualizations = Confirm.ask("Generate visualization plots?", default=True)
        
        # Run backtest
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold green]Running backtest...[/bold green]"),
            transient=True,
        ) as progress:
            progress.add_task("backtest", total=None)
            
            if run_all:
                results = trading_system.run_all_backtests()
                print_results_table(trading_system.all_strategy_results)
                
                if create_visualizations:
                    plot_equity_curves(trading_system.results)
                    plot_drawdowns(trading_system.results)
            else:
                results = trading_system.run_backtest(strategy_name)
                # Format single result for display
                if results and "error" not in results:
                    single_result = [{
                        "strategy_name": strategy_name,
                        "final_equity": results['Equity Curve'].iloc[-1],
                        "statistics": {
                            "Total Return (%)": results["Total Return (%)"],
                            "Annualized Return (%)": results["Annualized Return (%)"],
                            "Annualized Volatility (%)": results["Annualized Volatility (%)"],
                            "Sharpe Ratio": results["Sharpe Ratio"],
                            "Max Drawdown (%)": results["Max Drawdown (%)"]
                        }
                    }]
                    print_results_table(single_result)
                    
                    if create_visualizations:
                        # Create a dict with just this strategy for plotting
                        strategy_dict = {strategy_name: results}
                        plot_equity_curves(strategy_dict)
                        plot_drawdowns(strategy_dict)
    
    else:  # live mode
        # Strategy selection
        print_strategies()
        use_best = Confirm.ask("Use best performing strategy based on backtests?", default=True)
        
        strategy_name = None
        if not use_best:
            strategies = list(trading_system.strategies.keys())
            strategy_idx = int(Prompt.ask(
                "Select strategy by number", 
                choices=[str(i+1) for i in range(len(strategies))],
                default="1"
            ))
            strategy_name = strategies[strategy_idx-1]
            console.print(f"Selected strategy: [bold cyan]{strategy_name}[/bold cyan]")
        
        # Generate recommendations
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold green]Generating trading recommendations...[/bold green]"),
            transient=True,
        ) as progress:
            progress.add_task("generate", total=None)
            recommendations = trading_system.get_trading_recommendations(strategy_name)
        
        print_recommendations(recommendations)

def parse_args():
    """Parse command line arguments."""
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
    
    # Visualization option
    parser.add_argument('--visualize', action='store_true', help='Generate visualization plots of backtest results')
    
    # Add interactive mode flag
    parser.add_argument('--interactive', action='store_true', help='Run in interactive mode')
    
    return parser.parse_args()

def main():
    """Main function to run the CLI."""
    args = parse_args()
    
    # If no args provided or interactive flag set, run in interactive mode
    if args.interactive or len(sys.argv) == 1:
        interactive_mode()
        return
    
    # Otherwise, use the command line args
    print_header()
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold green]Initializing Trading System...[/bold green]"),
        transient=True,
    ) as progress:
        progress.add_task("init", total=None)
        trading_system = TradingSystem(
            user_tickers=args.tickers,
            start_date=args.start_date,
            end_date=args.end_date,
            cash=args.cash
        )
    
    if args.mode == 'backtest':
        console.print(f"[bold]Running backtest from {args.start_date} to {args.end_date}[/bold]")
        
        if args.strategy:
            console.print(f"[bold]Running backtest for {args.strategy} strategy[/bold]")
            with Progress(
                SpinnerColumn(),
                TextColumn(f"[bold green]Running {args.strategy} backtest...[/bold green]"),
                transient=True,
            ) as progress:
                progress.add_task("backtest", total=None)
                results = trading_system.run_backtest(args.strategy)
                
                # Format single result for display
                if results and "error" not in results:
                    single_result = [{
                        "strategy_name": args.strategy,
                        "final_equity": results['Equity Curve'].iloc[-1],
                        "statistics": {
                            "Total Return (%)": results["Total Return (%)"],
                            "Annualized Return (%)": results["Annualized Return (%)"],
                            "Annualized Volatility (%)": results["Annualized Volatility (%)"],
                            "Sharpe Ratio": results["Sharpe Ratio"],
                            "Max Drawdown (%)": results["Max Drawdown (%)"]
                        }
                    }]
                    print_results_table(single_result)
                    
                    # Generate visualizations if requested
                    if args.visualize:
                        strategy_dict = {args.strategy: results}
                        plot_equity_curves(strategy_dict)
                        plot_drawdowns(strategy_dict)
        else:
            console.print("[bold]Running backtest for all strategies[/bold]")
            with Progress(
                SpinnerColumn(),
                TextColumn("[bold green]Running all backtests...[/bold green]"),
                transient=True,
            ) as progress:
                progress.add_task("backtest", total=None)
                trading_system.run_all_backtests()
                print_results_table(trading_system.all_strategy_results)
                
                # Generate visualizations if requested
                if args.visualize:
                    plot_equity_curves(trading_system.results)
                    plot_drawdowns(trading_system.results)
            
    elif args.mode == 'live':
        console.print("[bold]Generating live trading recommendations[/bold]")
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold green]Generating trading recommendations...[/bold green]"),
            transient=True,
        ) as progress:
            progress.add_task("generate", total=None)
            recommendations = trading_system.get_trading_recommendations(args.strategy)
        
        print_recommendations(recommendations)

if __name__ == "__main__":
    main() 