import React, { useState } from 'react';
import { SearchRibbon } from './components/SearchRibbon';
import { EntityCard } from './components/EntityCard';
import { EntityCard as EntityCardType, SearchMode } from './types';
import { searchEntities } from './services/leiService';
import { Shield, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [results, setResults] = useState<EntityCardType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <SearchRibbon 
        onSearch={handleSearch} 
        onSave={handleSave}
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
              <div className="w-16 h-16 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Shield className="h-8 w-8 text-neutral-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Global Entity Search</h2>
              <p className="text-neutral-500 max-w-md mx-auto">
                Search by name, partial name, or LEI number to find official legal entity identifiers.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                <div className="p-4 bg-white border border-neutral-200 rounded-xl text-left shadow-sm">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">Official Data</h3>
                  <p className="text-xs text-neutral-500">Direct integration with the Global LEI Foundation (GLEIF) database.</p>
                </div>
                <div className="p-4 bg-white border border-neutral-200 rounded-xl text-left shadow-sm">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">Entity Status</h3>
                  <p className="text-xs text-neutral-500">Verify registration status, renewal dates, and legal addresses.</p>
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
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-400 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-bold tracking-tight text-neutral-500 uppercase">LEI Search Console</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Data provided by GLEIF API</span>
            <span>© 2026 Global Entity Search</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
