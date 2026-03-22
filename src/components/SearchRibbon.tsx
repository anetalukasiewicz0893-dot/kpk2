import React from 'react';
import { Search, Save, ChevronDown } from 'lucide-react';
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
  const [mode, setMode] = React.useState<SearchMode>('name');
  const [error, setError] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setError(false);
      onSearch(query.trim(), mode);
    } else {
      setError(true);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 transition-colors ${error ? 'text-rose-400' : 'text-neutral-400 group-focus-within:text-blue-500'}`} />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg transition-all outline-none text-sm ${
                error 
                  ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' 
                  : 'border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              placeholder={error ? "Please enter a search term..." : `Search by ${mode}...`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as SearchMode)}
                className="h-8 pl-2 pr-8 text-xs font-medium text-neutral-600 bg-transparent border-none focus:ring-0 cursor-pointer appearance-none"
              >
                <option value="name">Name</option>
                <option value="partial">Partial</option>
                <option value="lei">LEI</option>
              </select>
              <div className="absolute right-2 pointer-events-none">
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap border border-neutral-200"
          >
            <Save className="h-4 w-4" />
            Save Selected
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 animate-pulse w-full" />
      )}
    </div>
  );
};
