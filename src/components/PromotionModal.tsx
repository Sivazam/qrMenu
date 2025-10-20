'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getPromotionImage } from '@/lib/firestore';

interface PromotionModalProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function PromotionModal({ onClose, isOpen }: PromotionModalProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPromotionImage = async () => {
      try {
        setLoading(true);
        const url = await getPromotionImage();
        if (url) {
          setImageUrl(url);
        } else {
          setError('No promotion available');
          // If no promotion is available, close the modal after a short delay
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } catch (err) {
        setError('Failed to load promotion');
        console.error('Error fetching promotion:', err);
        // If there's an error, close the modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPromotionImage();
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
              aria-label="Close promotion"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Content */}
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center h-64 bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64 bg-gray-100">
                  <p className="text-gray-500 text-center px-4">{error}</p>
                </div>
              ) : imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Promotion"
                    className="w-full h-auto object-cover"
                    onError={() => setError('Failed to load image')}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}