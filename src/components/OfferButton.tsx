'use client';

import { motion } from 'framer-motion';
import { Mail, Gift } from 'lucide-react';

interface OfferButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function OfferButton({ onClick, isVisible }: OfferButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: -100 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0,
        x: isVisible ? 0 : -100
      }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 2 // Show after promotion modal would have appeared
      }}
      className="fixed bottom-6 left-6 z-40"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
        aria-label="View offers"
      >
        {/* Envelope Icon */}
        <div className="relative">
          <Mail className="w-6 h-6" />
          {/* Small notification dot */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
          />
        </div>
        
        {/* "Offer" Label */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0"
        >
          <div className="relative">
            Offer
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-800 border-y-4 border-y-transparent"></div>
          </div>
        </motion.div>

        {/* Pulse animation effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
        />
      </motion.button>
    </motion.div>
  );
}