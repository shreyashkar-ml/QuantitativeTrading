
import { motion } from 'framer-motion';

interface LoadingDisplayProps {
  isLoading: boolean;
  ticker: string;
}

export function LoadingDisplay({ isLoading, ticker }: LoadingDisplayProps) {
  if (!isLoading || !ticker) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="h-12 w-12 rounded-full border-4 border-primary border-r-transparent animate-spin mb-4"></div>
      <p className="text-muted-foreground">Calculating strategies for {ticker}...</p>
    </motion.div>
  );
}
