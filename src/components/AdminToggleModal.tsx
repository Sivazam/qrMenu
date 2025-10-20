'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Toggle, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: boolean;
  currentImageUrl: string | null;
  onStatusToggle: (newStatus: boolean) => Promise<void>;
  onImageUpload: (file: File) => Promise<void>;
}

export default function AdminToggleModal({ 
  isOpen, 
  onClose, 
  currentStatus, 
  currentImageUrl,
  onStatusToggle,
  onImageUpload 
}: AdminToggleModalProps) {
  const [status, setStatus] = useState(currentStatus);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusToggle = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await onStatusToggle(!status);
      setStatus(!status);
      setSuccess('Promotion status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await onImageUpload(selectedFile);
      setSuccess('Promotion image updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setSuccess('');
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
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Promotion Control Panel</h2>
              <p className="text-gray-600">Manage promotion status and image</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Promotion Status</h3>
                    <p className="text-sm text-gray-600">Toggle promotion on/off</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStatusToggle}
                    disabled={loading}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      status ? 'bg-green-500' : 'bg-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <motion.div
                      animate={{ x: status ? 24 : 4 }}
                      className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                    />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {status ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Promotion is Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Promotion is Inactive</span>
                    </>
                  )}
                </div>
              </div>

              {/* Current Image */}
              {currentImageUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Promotion Image</h3>
                  <div className="relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={currentImageUrl}
                      alt="Current promotion"
                      className="w-full h-48 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Promotion Image</h3>
                
                {/* File Input */}
                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to select image'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">All image types allowed</p>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {selectedFile && (
                  <button
                    onClick={handleImageUpload}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {success}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}