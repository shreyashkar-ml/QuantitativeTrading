
import { motion } from 'framer-motion';

interface ErrorDisplayProps {
  error: Error | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-8 p-4 bg-destructive/10 text-destructive rounded-lg max-w-xl mx-auto text-center"
    >
      <p>An error occurred while fetching strategy data. Please try again.</p>
    </motion.div>
  );
}
