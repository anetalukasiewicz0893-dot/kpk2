import React, { useState } from 'react';
import { SearchRibbon } from './components/SearchRibbon';
import { EntityCard } from './components/EntityCard';
import { ComparisonModal } from './components/ComparisonModal';
import { EntityCard as EntityCardType, SearchMode, ComparisonView } from './types';
import { searchEntities, generateComparisonSummary, performDeepInvestigation } from './services/leiService';
import { Shield, AlertCircle, Loader2, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeepInvestigationModal } from './components/DeepInvestigationModal';

export default function App() {
  const [results, setResults] = useState<EntityCardType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonView | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [deepInvestigation, setDeepInvestigation] = useState<{ entity: EntityCardType; report: string | null } | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const handleSearch = async (query: string, mode: SearchMode) => {
    setIsLoading(true);
    setError(null);
    try {
      const cards = await searchEntities(query, mode);
      setResults(cards);
      if (cards.length === 0) {
        setError("No entities found matching your search criteria.");
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setResults(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const handleDeepInvestigate = async (entity: EntityCardType) => {
    setDeepInvestigation({ entity, report: null });
    setIsInvestigating(true);
    try {
      const report = await performDeepInvestigation(entity);
      setDeepInvestigation({ entity, report });
    } catch (err) {
      alert("Deep investigation failed.");
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleCompare = async () => {
    const selected = results.filter(e => e.selected);
    if (selected.length < 2) {
      alert("Please select at least 2 entities to compare.");
      return;
    }
    setIsComparing(true);
    try {
      const result = await generateComparisonSummary(selected);
      setComparison(result);
    } catch (err) {
      alert("Failed to generate comparison summary.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleSave = () => {
    const selected = results.filter(e => e.selected);
    if (selected.length === 0) {
      alert("Please select at least one entity to save.");
      return;
    }
    const saved = JSON.parse(localStorage.getItem('saved_entities') || '[]');
    const newSaved = [...saved, ...selected.filter(s => !saved.find((e: any) => e.lei === s.lei))];
    localStorage.setItem('saved_entities', JSON.stringify(newSaved));
    alert(`${selected.length} entities saved to local storage.`);
  };

  const handleNotes = () => {
    alert("Notes feature coming soon. Use the comparison summary for detailed assessments.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SearchRibbon 
        onSearch={handleSearch} 
        onSave={handleSave}
        onCompare={handleCompare}
        onNotes={handleNotes}
        isLoading={isLoading}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700"
            >
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          ) : results.length === 0 && !isLoading ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-neutral-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Global Entity Investigation Console</h2>
              <p className="text-neutral-500 max-w-md mx-auto">
                Search by name, partial name, or LEI number to begin your investigation. 
                Analyze risk, check sanctions, and compare entities globally.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                <div className="p-4 bg-white border border-neutral-200 rounded-xl text-left">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">Deep Search</h3>
                  <p className="text-xs text-neutral-500">Access Global LEI records with real-time API integration.</p>
                </div>
                <div className="p-4 bg-white border border-neutral-200 rounded-xl text-left">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">Risk Scoring</h3>
                  <p className="text-xs text-neutral-500">Automated risk assessment based on status and jurisdiction.</p>
                </div>
                <div className="p-4 bg-white border border-neutral-200 rounded-xl text-left">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                    <Info className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">AI Insights</h3>
                  <p className="text-xs text-neutral-500">Generate professional KYC summaries and comparisons.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {results.map((entity, index) => (
                <EntityCard 
                  key={`entity-${entity.id}-${index}`} 
                  entity={entity} 
                  onToggleSelect={toggleSelect} 
                  onDeepInvestigate={handleDeepInvestigate}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {comparison && (
        <ComparisonModal 
          comparison={comparison} 
          onClose={() => setComparison(null)} 
        />
      )}

      {deepInvestigation && (
        <DeepInvestigationModal
          entityName={deepInvestigation.entity.legal_name}
          report={deepInvestigation.report}
          isLoading={isInvestigating}
          onClose={() => setDeepInvestigation(null)}
        />
      )}

      {isComparing && (
        <div className="fixed inset-0 z-[110] bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-neutral-900">Analyzing Entities...</h3>
            <p className="text-sm text-neutral-500">Generating AI comparison summary and risk assessment.</p>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-neutral-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-bold tracking-tight text-neutral-500">LEI INVESTIGATOR AI</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Global LEI API (GLEIF)</span>
            <span>© 2026 Global Entity Investigation Console</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
