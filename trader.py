import pandas as pd
import numpy as np

class Trader:
    def __init__(self, tickers, dfs, start, end, cash, alphas):
        self.tickers = tickers
        self.dfs = dfs
        self.start = start
        self.end = end
        self.alphas = alphas
        self.portfolio = {}
        self.cash = cash
        self.equity = []
        self.trade_dates = None

        if not tickers or not dfs:
            print("Warning: No tickers or dataframes provided.")
            return

        all_dates = pd.Index([])
        for df in self.dfs.values():
            all_dates = all_dates.union(df.index)
        all_dates = pd.DatetimeIndex(all_dates)
        trade_range = all_dates[(all_dates >= self.start) & (all_dates <= self.end)]

        for alpha in self.alphas:
            alpha.pre_compute(trade_range)
            alpha.post_compute(trade_range)

    def run_backtest(self):
        if not self.tickers or not self.dfs:
            print("Cannot run backtest: No valid tickers or data.")
            return

        all_dates = pd.Index([])
        for df in self.dfs.values():
            all_dates = all_dates.union(df.index)
        all_dates = pd.DatetimeIndex(all_dates)
        self.trade_dates = all_dates[(all_dates >= self.start) & (all_dates <= self.end)]

        print(f"Running backtest over {len(self.trade_dates)} dates.")
        for date in self.trade_dates:
            available_tickers = [ticker for ticker in self.tickers if date in self.dfs[ticker].index]
            if not available_tickers:
                continue
            equity = self.cash + sum(
                self.portfolio.get(ticker, 0) * self.dfs[ticker].loc[date, 'close']
                for ticker in available_tickers
            )
            if pd.isna(equity):
                print(f"Warning: Equity is NaN on {date}")
                equity = self.equity[-1] if self.equity else 100000  # Fallback to last valid or initial
            self.equity.append(equity)
            signals = self.generate_signals(date)
            if not signals:
                print(f"No signals generated for {date}")
            self.manage_portfolio(signals, date, equity)

    def generate_signals(self, date, return_alpha_values=False):
        alpha_values = {}
        for alpha in self.alphas:
            alpha_name = alpha.name
            values = {}
            for ticker in self.tickers:
                if date in self.dfs[ticker].index and self.dfs[ticker].loc[date, 'eligible']:
                    val = self.dfs[ticker].loc[date, alpha_name]
                    values[ticker] = val if not pd.isna(val) else 0
            alpha_values[alpha_name] = values

        standardized = {}
        for alpha_name, values in alpha_values.items():
            if values:
                vals = list(values.values())
                mean = np.mean(vals)
                std = np.std(vals)
                if std > 0:
                    standardized[alpha_name] = {ticker: (v - mean) / std for ticker, v in values.items()}
                else:
                    standardized[alpha_name] = {ticker: 0 for ticker in values}

        composite_alpha = {}
        for ticker in self.tickers:
            if all(ticker in standardized[alpha_name] for alpha_name in standardized):
                composite_alpha[ticker] = sum(
                    standardized[alpha_name][ticker] for alpha_name in standardized
                )

        if composite_alpha:
            sorted_tickers = sorted(composite_alpha, key=composite_alpha.get)
            n = len(sorted_tickers)
            long_count = max(1, n // 4)
            short_count = max(1, n // 4)
            signals = {}
            for i, ticker in enumerate(sorted_tickers):
                if i < short_count:
                    signals[ticker] = -1
                elif i >= n - long_count:
                    signals[ticker] = 1
                else:
                    signals[ticker] = 0
                    
            if return_alpha_values:
                return {"signals": signals, "alpha_values": composite_alpha}
            return signals
            
        if return_alpha_values:
            return {"signals": {}, "alpha_values": {}}
        return {}

    def manage_portfolio(self, signals, date, equity):
        long_tickers = [ticker for ticker, signal in signals.items() if signal == 1]
        short_tickers = [ticker for ticker, signal in signals.items() if signal == -1]
        n_long = len(long_tickers)
        n_short = len(short_tickers)

        w_long = 1 / n_long if n_long > 0 else 0
        w_short = -1 / n_short if n_short > 0 else 0

        for ticker in long_tickers:
            if date in self.dfs[ticker].index:
                price = self.dfs[ticker].loc[date, 'close']
                target_shares = (w_long * equity) / price
                current_shares = self.portfolio.get(ticker, 0)
                trade_shares = target_shares - current_shares
                cost = trade_shares * price
                self.cash -= cost
                self.portfolio[ticker] = current_shares + trade_shares

        for ticker in short_tickers:
            if date in self.dfs[ticker].index:
                price = self.dfs[ticker].loc[date, 'close']
                target_shares = (w_short * equity) / price
                current_shares = self.portfolio.get(ticker, 0)
                trade_shares = target_shares - current_shares
                cost = trade_shares * price
                self.cash -= cost
                self.portfolio[ticker] = current_shares + trade_shares

        for ticker in list(self.portfolio.keys()):
            if ticker not in long_tickers and ticker not in short_tickers and date in self.dfs[ticker].index:
                shares = self.portfolio[ticker]
                price = self.dfs[ticker].loc[date, 'close']
                self.cash += shares * price
                del self.portfolio[ticker]

    def get_pnl_stats(self):
        if not self.equity or len(self.equity) < 2:
            return {"error": "Insufficient equity data for stats"}

        equity_series = pd.Series(self.equity, index=self.trade_dates[:len(self.equity)])
        if equity_series.isna().all():
            return {"error": "Equity series is all NaN"}
        daily_returns = equity_series.pct_change().dropna()
        cumulative_returns = (equity_series / equity_series.iloc[0] - 1) * 100

        mean_daily_return = daily_returns.mean()
        std_daily_return = daily_returns.std()
        annualized_return = mean_daily_return * 252
        annualized_volatility = std_daily_return * np.sqrt(252)
        sharpe_ratio = annualized_return / annualized_volatility if annualized_volatility > 0 else 0

        rolling_max = equity_series.cummax()
        drawdowns = (equity_series - rolling_max) / rolling_max
        max_drawdown = drawdowns.min() * 100

        return {
            "Total Return (%)": cumulative_returns.iloc[-1],
            "Annualized Return (%)": annualized_return * 100,
            "Annualized Volatility (%)": annualized_volatility * 100,
            "Sharpe Ratio": sharpe_ratio,
            "Max Drawdown (%)": max_drawdown,
            "Daily Returns": daily_returns,
            "Cumulative Returns": cumulative_returns,
            "Equity Curve": equity_series
        }
        
    def trade_indicator(self, current_date=None):
        """
        Generate trading signals for the current day based on backtest performance over 
        multiple historical intervals (1 month, 6 months, and 2 years).
        
        Args:
            current_date: The date to generate signals for (defaults to today)
            
        Returns:
            dict: A dictionary containing the best performing strategy name and 
                  recommended long and short positions
        """
        if not self.tickers or not self.dfs:
            return {"error": "No valid tickers or data."}
            
        # Use today's date if not specified
        if current_date is None:
            current_date = pd.Timestamp.today().normalize()
        
        # Get all available dates in the dataset
        all_dates = pd.Index([])
        for df in self.dfs.values():
            all_dates = all_dates.union(df.index)
        all_dates = pd.DatetimeIndex(sorted(all_dates))
        
        # Find the last active trading day before current_date
        valid_dates = all_dates[all_dates < current_date]
        if len(valid_dates) == 0:
            return {"error": f"No data available before {current_date}"}
            
        last_active_day = valid_dates[-1]
        print(f"Using {last_active_day} as the reference day for generating signals")
        
        # Check if we have enough tickers with data on the last active day
        valid_tickers = [t for t in self.tickers if last_active_day in self.dfs[t].index]
        if not valid_tickers:
            return {"error": f"No ticker data available for {last_active_day}"}
            
        # Define the three backtesting periods from the last active day
        periods = {
            "1_month": last_active_day - pd.Timedelta(days=30),
            "6_months": last_active_day - pd.Timedelta(days=180),
            "2_years": last_active_day - pd.Timedelta(days=730)
        }
        
        # Store results for each period
        period_results = {}
        
        # Run backtests for each period
        for period_name, start_date in periods.items():
            if start_date < self.start:
                start_date = self.start
                
            # Create a copy of self with the specific time period
            period_trader = Trader(self.tickers, self.dfs, start_date, last_active_day, self.cash, self.alphas)  
            period_trader.run_backtest()
            
            # Collect performance stats
            stats = period_trader.get_pnl_stats()
            if "error" not in stats:
                period_results[period_name] = {
                    "stats": stats,
                    "signals": period_trader.generate_signals(last_active_day)
                }
        
        # Determine best strategy based on Sharpe ratio across periods
        best_period = None
        best_sharpe = -float('inf')
        
        for period, result in period_results.items():
            if "stats" in result and "Sharpe Ratio" in result["stats"]:
                sharpe = result["stats"]["Sharpe Ratio"]
                if sharpe > best_sharpe:
                    best_sharpe = sharpe
                    best_period = period
        
        if best_period is None:
            return {"error": "Could not determine best strategy from backtest results"}
        
        # Use signals from the best performing period
        signal_result = self.generate_signals(last_active_day, return_alpha_values=True)
        signals = signal_result["signals"] if isinstance(signal_result, dict) and "signals" in signal_result else period_results[best_period]["signals"]
        alpha_values = signal_result.get("alpha_values", {}) if isinstance(signal_result, dict) else {}
        
        # For debugging
        print(f"Alpha values found: {len(alpha_values)}")
        
        # Group tickers by signal
        long_tickers = [ticker for ticker, signal in signals.items() if signal == 1]
        short_tickers = [ticker for ticker, signal in signals.items() if signal == -1]
        
        # Calculate position details
        positions = []
        
        # Calculate total equity (assuming we start with self.cash)
        equity = self.cash
        
        # Calculate weights
        n_long = len(long_tickers)
        n_short = len(short_tickers)
        total_positions = n_long + n_short
        
        if total_positions == 0:
            cash_position = "100%"
            return {
                "best_period": best_period,
                "strategy": f"{', '.join([alpha.name for alpha in self.alphas])}",
                "date": current_date.strftime('%Y-%m-%d'),
                "reference_date": last_active_day.strftime('%Y-%m-%d'),
                "sharpe_ratio": best_sharpe,
                "cash_position": cash_position,
                "positions": []
            }
        
        # Calculate volatility for each ticker (using 20-day historical volatility)
        volatilities = {}
        for ticker in self.tickers:
            if last_active_day in self.dfs[ticker].index:
                # Get last 20 days of price data
                hist_data = self.dfs[ticker].loc[:last_active_day].tail(30)
                if len(hist_data) > 5:  # Ensure we have enough data
                    returns = hist_data['close'].pct_change().dropna()
                    volatilities[ticker] = returns.std()
                else:
                    volatilities[ticker] = 0.02  # Default volatility if not enough data
        
        # Calculate signal-weighted allocations (stronger alpha = higher allocation)
        long_weights = {}
        short_weights = {}
        
        # Find max absolute alpha values for normalization
        max_long_alpha = 0.001  # Small default to avoid division by zero
        max_short_alpha = 0.001
        
        # First get the max values for scaling
        for ticker in long_tickers:
            if ticker in alpha_values:
                abs_alpha = abs(alpha_values[ticker])
                max_long_alpha = max(max_long_alpha, abs_alpha)
                
        for ticker in short_tickers:
            if ticker in alpha_values:
                abs_alpha = abs(alpha_values[ticker])
                max_short_alpha = max(max_short_alpha, abs_alpha)
        
        # Calculate risk-adjusted weights
        long_weight_sum = 0
        for ticker in long_tickers:
            alpha_strength = abs(alpha_values.get(ticker, 0.001)) / max_long_alpha
            vol_adjustment = 0.02 / max(volatilities.get(ticker, 0.02), 0.005)  # Inverse volatility (with floor)
            long_weights[ticker] = alpha_strength * vol_adjustment
            long_weight_sum += long_weights[ticker]
            
        short_weight_sum = 0
        for ticker in short_tickers:
            alpha_strength = abs(alpha_values.get(ticker, 0.001)) / max_short_alpha
            vol_adjustment = 0.02 / max(volatilities.get(ticker, 0.02), 0.005)  # Inverse volatility (with floor) 
            short_weights[ticker] = alpha_strength * vol_adjustment
            short_weight_sum += short_weights[ticker]
        
        # Normalize weights to sum to 1
        if long_weight_sum > 0:
            long_weights = {t: w/long_weight_sum for t, w in long_weights.items()}
        else:
            long_weights = {t: 1/n_long for t in long_tickers} if n_long > 0 else {}
            
        if short_weight_sum > 0:  
            short_weights = {t: w/short_weight_sum for t, w in short_weights.items()}
        else:
            short_weights = {t: 1/n_short for t in short_tickers} if n_short > 0 else {}
        
        # Set long/short capital allocation (50/50 split of equity)
        long_capital = equity * 0.5 if n_long > 0 else 0
        short_capital = equity * 0.5 if n_short > 0 else 0
        
        # Allocate capital equally among positions
        # For long positions, we're allocating based on signal strength and volatility
        for ticker in long_tickers:
            if last_active_day in self.dfs[ticker].index:
                price = self.dfs[ticker].loc[last_active_day, 'close']
                if pd.isna(price) or price <= 0:
                    continue
                
                weight = long_weights.get(ticker, 1/n_long)
                capital_allocation = weight * long_capital
                units = int(capital_allocation / price)
                
                positions.append({
                    "ticker": ticker,
                    "position": "LONG",
                    "units": units,
                    "price": price,
                    "capital_allocation": capital_allocation,
                    "allocation_percentage": f"{weight * 50:.2f}%",  # As % of total portfolio
                    "alpha_strength": alpha_values.get(ticker, 0),
                    "volatility": volatilities.get(ticker, 0)
                })
        
        # For short positions
        for ticker in short_tickers:
            if last_active_day in self.dfs[ticker].index:
                price = self.dfs[ticker].loc[last_active_day, 'close']
                if pd.isna(price) or price <= 0:
                    continue
                
                weight = short_weights.get(ticker, 1/n_short)
                capital_allocation = weight * short_capital
                units = int(capital_allocation / price)
                
                positions.append({
                    "ticker": ticker,
                    "position": "SHORT",
                    "units": units,
                    "price": price,
                    "capital_allocation": capital_allocation,
                    "allocation_percentage": f"{weight * 50:.2f}%",  # As % of total portfolio
                    "alpha_strength": alpha_values.get(ticker, 0),
                    "volatility": volatilities.get(ticker, 0)
                })
        
        # Calculate cash position as percentage of total positions
        neutral_tickers = len(self.tickers) - total_positions
        cash_percentage = (neutral_tickers / len(self.tickers)) * 100
        cash_position = f"{cash_percentage:.1f}%"
        
        return {
            "best_period": best_period,
            "strategy": f"{', '.join([alpha.name for alpha in self.alphas])}",
            "long_tickers": long_tickers,
            "short_tickers": short_tickers,
            "date": current_date.strftime('%Y-%m-%d'),
            "reference_date": last_active_day.strftime('%Y-%m-%d'),
            "sharpe_ratio": best_sharpe,
            "cash_position": cash_position,
            "positions": positions
        }