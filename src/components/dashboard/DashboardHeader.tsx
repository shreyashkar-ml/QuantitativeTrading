
import { motion } from 'framer-motion';

export function DashboardHeader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 text-center"
    >
      <h1 className="text-4xl font-bold mb-3">Algorithmic Trading Dashboard</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Analyze and compare different trading strategies with real-time performance metrics
      </p>
    </motion.div>
  );
}
