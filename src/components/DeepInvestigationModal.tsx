import React from 'react';
import { X, Shield, Info, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface DeepInvestigationModalProps {
  entityName: string;
  report: string | null;
  onClose: () => void;
  isLoading: boolean;
}

export const DeepInvestigationModal: React.FC<DeepInvestigationModalProps> = ({ 
  entityName, report, onClose, isLoading 
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Deep Investigation</h2>
                <p className="text-xs text-neutral-500">{entityName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                <p className="text-sm font-bold text-neutral-900">Searching Public Records...</p>
                <p className="text-xs text-neutral-500">Accessing news, financial reports, and regulatory filings.</p>
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                <div className="markdown-body text-sm text-neutral-700">
                  <Markdown>{report || "No data found."}</Markdown>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-900 text-white text-sm font-bold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
