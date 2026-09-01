import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, FileText } from 'lucide-react';
import { mlApi } from '../mlApi';

interface SemanticSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries?: any[];
}

export const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({
  isOpen,
  onClose,
  entries = []
}) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await mlApi.semanticSearch(query, entries);
      setResults(data.results || []);
    } catch (err) {
      console.error('Semantic search error:', err);
    } finally {
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-panel-glow max-w-xl w-full p-6 text-white relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg gold-gradient-text">Semantic Vector Search</h3>
              <p className="text-xs text-zinc-400">ML Cosine Similarity Search over Encrypted Journal Reflections</p>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by feeling, theme or context (e.g., 'moments of gratitude')..."
                className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="glass-button px-4 py-2.5 text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {results.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                Enter a search query to run semantic vector matching across your reflections.
              </div>
            ) : (
              results.map((item, idx) => (
                <div key={idx} className="glass-card p-3 flex flex-col gap-1 border-zinc-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> {item.title || 'Untitled Reflection'}
                    </span>
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Match: {((item.semantic_similarity_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-2">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
