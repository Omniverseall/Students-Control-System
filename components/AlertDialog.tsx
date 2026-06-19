import React from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function AlertDialog() {
  const { alertDialog, closeAlert } = useStore();

  const icons = {
    success: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    error: <AlertCircle className="w-8 h-8 text-error" />,
    info: <Info className="w-8 h-8 text-primary" />,
  };

  return (
    <AnimatePresence>
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={closeAlert}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-surface border border-border rounded-xl p-6 shadow-2xl flex flex-col items-center text-center"
          >
            <div className="mb-4">
              {icons[alertDialog.type]}
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              {alertDialog.title}
            </h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              {alertDialog.message}
            </p>
            <button 
              onClick={closeAlert} 
              className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors"
            >
              Понятно
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
