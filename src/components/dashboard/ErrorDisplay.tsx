
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
      {/* You can add more detailed error information from your Python function here */}
      {process.env.NODE_ENV === 'development' && (
        <p className="text-sm mt-2 text-destructive/80">{error.message}</p>
      )}
    </motion.div>
  );
}
