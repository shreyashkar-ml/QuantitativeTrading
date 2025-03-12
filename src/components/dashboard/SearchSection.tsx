
import { motion } from 'framer-motion';
import TickerSearch from '../TickerSearch';

interface SearchSectionProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
}

export function SearchSection({ onSearch, isLoading }: SearchSectionProps) {
  // This component forwards the search request to the parent component
  // You can modify this if you need to preprocess the ticker before sending to Python
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-10"
    >
      <TickerSearch onSearch={onSearch} isLoading={isLoading} />
    </motion.div>
  );
}
