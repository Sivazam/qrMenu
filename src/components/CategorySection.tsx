'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '@/lib/firestore';
import MenuCard from './MenuCard';

interface CategorySectionProps {
  categoryName: string;
  items: MenuItem[];
  onPortionChange: (itemId: string, portion: 'full' | 'half') => void;
  selectedPortions: Record<string, 'full' | 'half'>;
}

export default function CategorySection({ 
  categoryName, 
  items, 
  onPortionChange,
  selectedPortions 
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors duration-200"
          onClick={toggleExpanded}
        >
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            {categoryName}
            <span className="text-sm font-normal text-muted-foreground">
              ({items.length} items)
            </span>
          </h2>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-muted-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MenuCard
                    item={item}
                    selectedPortion={selectedPortions[item.id] || 'full'}
                    onPortionChange={(portion) => onPortionChange(item.id, portion)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}