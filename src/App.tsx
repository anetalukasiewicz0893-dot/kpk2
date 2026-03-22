import React, { useState } from 'react';
import { SearchRibbon } from './components/SearchRibbon';
import { EntityCard } from './components/EntityCard';
import { EntityCard as EntityCardType, SearchMode } from './types';
import { searchEntities } from './services/leiService';
import { Shield, AlertCircle, Search, Terminal } from 'lucide-react';
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
        setError(">> ERROR: NO_ENTITIES_FOUND_IN_DATABASE <<");
      }
    } catch (err) {
      setError(`>> CRITICAL_FAILURE: ${err instanceof Error ? err.message : 'UNKNOWN_ERROR'} <<`);
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
      alert(">> ERROR: NO_DATA_SELECTED_FOR_BACKUP <<");
      return;
    }
    const saved = JSON.parse(localStorage.getItem('saved_entities') || '[]');
    const newSaved = [...saved, ...selected.filter(s => !saved.find((e: any) => e.lei === s.lei))];
    localStorage.setItem('saved_entities', JSON.stringify(newSaved));
    alert(`>> SUCCESS: ${selected.length} RECORDS_STORED_IN_LOCAL_CACHE <<`);
  };

  return (
    <div className="min-h-screen flex flex-col">
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-8 p-4 border-2 border-rose-500 bg-rose-500/10 flex items-center gap-3 text-rose-500 font-hacker text-xl tracking-tighter"
            >
              <AlertCircle className="h-6 w-6" />
              <p>{error}</p>
            </motion.div>
          ) : results.length === 0 && !isLoading ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 hacker-panel flex items-center justify-center mb-8 hacker-border animate-pulse">
                <Terminal className="h-12 w-12 text-hacker-blue" />
              </div>
              <h2 className="text-4xl font-hacker hacker-glow mb-4 tracking-widest uppercase">Global Entity Investigator</h2>
              <p className="text-hacker-blue/60 max-w-md mx-auto font-mono text-sm leading-relaxed">
                [ SYSTEM_STATUS: ONLINE ]<br/>
                [ ACCESS_LEVEL: RESTRICTED ]<br/>
                Search by name or LEI to intercept legal entity records from the global mainframe.
              </p>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                <div className="hacker-panel p-6 text-left group hover:border-hacker-blue transition-all">
                  <div className="w-10 h-10 border border-hacker-blue/30 flex items-center justify-center mb-4 group-hover:bg-hacker-blue/10">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-hacker hacker-glow mb-2 uppercase">Raw Data Access</h3>
                  <p className="text-xs text-hacker-blue/50 font-mono">Direct uplink to GLEIF central database. No filters, no AI, just raw legal identifiers.</p>
                </div>
                <div className="hacker-panel p-6 text-left group hover:border-hacker-blue transition-all">
                  <div className="w-10 h-10 border border-hacker-blue/30 flex items-center justify-center mb-4 group-hover:bg-hacker-blue/10">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-hacker hacker-glow mb-2 uppercase">Verification</h3>
                  <p className="text-xs text-hacker-blue/50 font-mono">Verify registration status and renewal cycles across all global jurisdictions.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 hacker-panel border-hacker-blue/20 bg-hacker-blue/5">
                <div className="flex items-center gap-2 font-hacker text-sm text-hacker-blue/60">
                  <Cpu className="h-4 w-4" />
                  <span>RECORDS_RETRIEVED: {results.length}</span>
                </div>
                
                <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <span className="text-hacker-blue/30">HIGH_RISK:</span>
                    <span className="text-rose-500 font-bold">{results.filter(r => r.risk.overall_score === 'High').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-hacker-blue/30">MEDIUM_RISK:</span>
                    <span className="text-amber-500 font-bold">{results.filter(r => r.risk.overall_score === 'Medium').length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-hacker-blue/30">LOW_RISK:</span>
                    <span className="text-emerald-500 font-bold">{results.filter(r => r.risk.overall_score === 'Low').length}</span>
                  </div>
                </div>
              </div>

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

      <footer className="bg-hacker-bg border-t-2 border-hacker-blue/20 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-hacker-blue/30 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 opacity-50" />
            <span className="hacker-glow text-hacker-blue/60">LEI_SEARCH_CONSOLE_V2.0</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hover:text-hacker-blue transition-colors cursor-help">SOURCE: GLEIF_MAIN_API</span>
            <span className="hover:text-hacker-blue transition-colors cursor-help">ENCRYPTION: AES-256</span>
            <span>© 2026 HACKER_CORP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Cpu = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
  </svg>
);
