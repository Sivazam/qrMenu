'use client';

import { motion } from 'framer-motion';
import { MenuItem } from '@/lib/firestore';

interface MenuCardProps {
  item: MenuItem;
  selectedPortion: 'full' | 'half';
  onPortionChange: (portion: 'full' | 'half') => void;
}

export default function MenuCard({ item, selectedPortion, onPortionChange }: MenuCardProps) {
  const displayPrice = selectedPortion === 'half' && item.hasHalfPortion 
    ? item.halfPortionCost 
    : item.price;

  const getVegIndicator = () => {
    if (item.isVegetarian) {
      return (
        <div className="w-5 h-5 bg-white border-2 border-green-600 rounded-sm flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
        </div>
      );
    } else {
      return (
        <div className="w-5 h-5 bg-white border-2 border-red-600 rounded-sm flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-border"
    >
      <div className="flex p-4 gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            {getVegIndicator()}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary font-bold text-lg">
                  ₹{displayPrice}
                </span>
                {item.hasHalfPortion && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onPortionChange('full')}
                      className={`px-2 py-1 text-xs rounded-md transition-colors duration-200 ${
                        selectedPortion === 'full'
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Full
                    </button>
                    <button
                      onClick={() => onPortionChange('half')}
                      className={`px-2 py-1 text-xs rounded-md transition-colors duration-200 ${
                        selectedPortion === 'half'
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      Half
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {item.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
          
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                Allergens: {item.allergens.join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {item.imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg shadow-sm border border-border"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}