
import { motion } from 'framer-motion';

export function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="text-center py-20"
    >
      <h2 className="text-2xl font-semibold mb-4">Welcome to AlgoTrader</h2>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Enter a ticker symbol above to analyze trading strategies and view performance metrics.
      </p>
    </motion.div>
  );
}
