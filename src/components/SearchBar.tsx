'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
    >
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search dishes..."
          className="w-full pl-12 pr-4 py-3 border-2 border-orange-500 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-card text-foreground shadow-sm transition-all duration-200 placeholder-muted-foreground hover:border-orange-400 hover:shadow-md"
        />
      </div>
    </motion.div>
  );
}