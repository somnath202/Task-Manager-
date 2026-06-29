import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg
  className = ''
}) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            className={`glass-modal w-full ${sizes[size]} rounded-3xl p-6 relative overflow-hidden z-10 border border-white/10 dark:border-slate-800 ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800/80 pb-4 mb-5">
              <h3 id="dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Dialog;
