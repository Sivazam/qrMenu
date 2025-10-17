'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

export type FilterType = 'all' | 'veg' | 'non-veg';
export type SortType = 'default' | 'price-low-high' | 'price-high-low';

interface FilterBarProps {
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
  activeFilter: FilterType;
  activeSort: SortType;
}

export default function FilterBar({ 
  onFilterChange, 
  onSortChange, 
  activeFilter, 
  activeSort 
}: FilterBarProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filters = [
    { type: 'all' as FilterType, label: 'All', color: 'bg-muted text-muted-foreground' },
    { type: 'veg' as FilterType, label: 'Veg', color: 'bg-primary text-primary-foreground' },
    { type: 'non-veg' as FilterType, label: 'Non-Veg', color: 'bg-destructive text-destructive-foreground' },
  ];

  const sortOptions = [
    { type: 'default' as SortType, label: 'Default' },
    { type: 'price-low-high' as SortType, label: 'Price: Low to High' },
    { type: 'price-high-low' as SortType, label: 'Price: High to Low' },
  ];

  const getFilterStyle = (filter: FilterType) => {
    if (activeFilter === filter) {
      const activeFilterConfig = filters.find(f => f.type === filter);
      return `${activeFilterConfig?.color} shadow-md`;
    }
    return 'bg-card text-muted-foreground border border-border hover:bg-muted hover:border-primary/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-lg shadow-sm border border-border"
    >
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(filter.type)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${getFilterStyle(filter.type)}`}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className="flex items-center gap-2 px-6 py-2 bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted hover:border-primary/50 transition-all duration-200"
        >
          Sort By
          <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
        </motion.button>

        {showSortDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50"
          >
            {sortOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  onSortChange(option.type);
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors duration-200 ${
                  activeSort === option.type ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'
                } ${option.type === 'default' ? 'rounded-t-lg' : ''} ${
                  option.type === 'price-high-low' ? 'rounded-b-lg' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}