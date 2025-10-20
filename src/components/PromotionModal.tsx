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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Calculate modal max size based on viewport and image aspect ratio
  const getModalStyle = () => {
    if (!imageDimensions.width || !imageDimensions.height) {
      return { maxWidth: '90vw', maxHeight: '90vh' };
    }

    const aspectRatio = imageDimensions.width / imageDimensions.height;
    const viewportWidth = window.innerWidth * 0.9;
    const viewportHeight = window.innerHeight * 0.9;
    
    let modalWidth, modalHeight;
    
    if (aspectRatio > 1) {
      // Wider image - base on width
      modalWidth = Math.min(viewportWidth, imageDimensions.width);
      modalHeight = modalWidth / aspectRatio;
      
      // Check if height exceeds viewport
      if (modalHeight > viewportHeight) {
        modalHeight = viewportHeight;
        modalWidth = modalHeight * aspectRatio;
      }
    } else {
      // Taller image - base on height
      modalHeight = Math.min(viewportHeight, imageDimensions.height);
      modalWidth = modalHeight * aspectRatio;
      
      // Check if width exceeds viewport
      if (modalWidth > viewportWidth) {
        modalWidth = viewportWidth;
        modalHeight = modalWidth / aspectRatio;
      }
    }

    return {
      width: `${modalWidth}px`,
      height: `${modalHeight}px`,
      maxWidth: '90vw',
      maxHeight: '90vh'
    };
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
            className="relative bg-black shadow-2xl rounded-2xl overflow-hidden"
            style={getModalStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Positioned on top of image */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-black/80 transition-all duration-200 hover:scale-110"
              aria-label="Close promotion"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Content */}
            <div className="relative w-full h-full">
              {loading ? (
                <div className="flex items-center justify-center w-full h-full bg-black">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center w-full h-full bg-black">
                  <p className="text-white text-center px-4">{error}</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Promotion"
                  className="w-full h-full object-contain"
                  onLoad={handleImageLoad}
                  onError={() => setError('Failed to load image')}
                />
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}