'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface FloatingMenuProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export default function FloatingMenu({ categories, onCategoryClick }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-primary/90 transition-colors duration-200 px-4 py-3 gap-2"
      >
        {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        <span className="text-sm font-medium">Menu</span>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-72 bg-card border border-border rounded-xl shadow-2xl z-40 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-lg">Menu Categories</h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors duration-200 border-b border-border last:border-b-0"
                >
                  <span className="text-foreground font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {category.itemCount}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}