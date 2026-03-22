import React from 'react';
import { Search, Save, Terminal, Cpu } from 'lucide-react';
import { SearchMode } from '../types';

interface SearchRibbonProps {
  onSearch: (query: string, mode: SearchMode) => void;
  onSave: () => void;
  isLoading: boolean;
}

export const SearchRibbon: React.FC<SearchRibbonProps> = ({ 
  onSearch, onSave, isLoading 
}) => {
  const [query, setQuery] = React.useState('');
  const [searchType, setSearchType] = React.useState<'NAME' | 'LEI'>('NAME');
  const [error, setError] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setError(false);
      // For NAME, we use 'partial' mode which uses 'q' parameter for auto-detection of full/partial
      const mode: SearchMode = searchType === 'NAME' ? 'partial' : 'lei';
      onSearch(query.trim(), mode);
    } else {
      setError(true);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-hacker-bg border-b-4 border-hacker-blue shadow-[0_4px_20px_rgba(0,242,255,0.2)] px-4 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
        {/* Terminal Header */}
        <div className="hidden lg:flex items-center gap-2 text-hacker-blue/50 font-hacker text-sm">
          <Terminal className="h-4 w-4" />
          <span className="animate-pulse">SYS_READY_V2.0.4</span>
        </div>

        <div className="flex-1 w-full">
          <form onSubmit={handleSearch} className="relative flex items-stretch">
            {/* Toggle Switch */}
            <div className="flex bg-hacker-border/30 border-2 border-hacker-blue mr-2 p-1">
              <button
                type="button"
                onClick={() => setSearchType('NAME')}
                className={`px-4 py-1 font-hacker text-lg transition-all ${
                  searchType === 'NAME' 
                    ? 'bg-hacker-blue text-hacker-bg shadow-[0_0_10px_rgba(0,242,255,0.8)]' 
                    : 'text-hacker-blue/50 hover:text-hacker-blue'
                }`}
              >
                NAME
              </button>
              <button
                type="button"
                onClick={() => setSearchType('LEI')}
                className={`px-4 py-1 font-hacker text-lg transition-all ${
                  searchType === 'LEI' 
                    ? 'bg-hacker-blue text-hacker-bg shadow-[0_0_10px_rgba(0,242,255,0.8)]' 
                    : 'text-hacker-blue/50 hover:text-hacker-blue'
                }`}
              >
                LEI
              </button>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors ${error ? 'text-rose-500' : 'text-hacker-blue'}`} />
              </div>
              <input
                type="text"
                className={`block w-full pl-12 pr-4 py-3 bg-hacker-bg border-2 font-mono text-lg transition-all outline-none ${
                  error 
                    ? 'border-rose-500 text-rose-500 shadow-[inset_0_0_10px_rgba(244,63,94,0.3)]' 
                    : 'border-hacker-blue text-hacker-blue shadow-[inset_0_0_10px_rgba(0,242,255,0.1)] focus:shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                }`}
                placeholder={error ? ">> INPUT_REQUIRED_ <<" : `>> ENTER_${searchType}_HERE...`}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error && e.target.value.trim()) setError(false);
                }}
              />
            </div>
            
            <button 
              type="submit"
              className="ml-2 hacker-button flex items-center gap-2"
            >
              <Cpu className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              EXECUTE
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className="hacker-button flex items-center gap-2 text-sm py-1.5"
          >
            <Save className="h-4 w-4" />
            BACKUP_DATA
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-hacker-border/20">
        {isLoading && (
          <div className="h-full bg-hacker-blue shadow-[0_0_10px_#00f2ff] animate-[loading_2s_infinite_linear]" />
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; left: 0%; }
          50% { width: 30%; left: 35%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  );
};
