import React from 'react';
import { X, Copy, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ComparisonView } from '../types';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface ComparisonModalProps {
  comparison: ComparisonView | null;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ comparison, onClose }) => {
  if (!comparison) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Copy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Entity Comparison</h2>
                <p className="text-xs text-neutral-500">Comparing {comparison.entities.length} entities • Similarity Score: {comparison.similarity_score}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="h-4 w-4" />
                AI Summary & Assessment
              </h3>
              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                <div className="markdown-body text-sm text-neutral-700">
                  <Markdown>{comparison.summary}</Markdown>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Key Differences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(comparison.differences).map(([key, value]) => (
                  <div key={`diff-${key}`} className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{key.replace('_', ' ')}</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{value as string}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Compared Entities
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {comparison.entities.map((entity, index) => (
                  <div key={`comp-entity-${entity.id}-${index}`} className="min-w-[300px] p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <p className="font-bold text-neutral-900 mb-1 truncate">{entity.legal_name}</p>
                    <p className="text-xs text-neutral-500 font-mono mb-3">{entity.lei}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400">Status</span>
                        <span className="font-medium">{entity.status}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400">Country</span>
                        <span className="font-medium">{entity.country}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400">Risk</span>
                        <span className={`font-bold ${entity.risk.overall_score === 'High' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {entity.risk.overall_score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-900 text-white text-sm font-bold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Close Investigation
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
