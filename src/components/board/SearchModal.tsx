"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNotesStore, Note } from '@/store/useNotesStore';
import api from '@/lib/api';
import { Search, X, Hash, Clock, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPlainText = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
};

export default function SearchModal() {
  const isSearchOpen = useNotesStore(state => state.isSearchOpen);
  const setIsSearchOpen = useNotesStore(state => state.setIsSearchOpen);
  const notes = useNotesStore(state => state.notes);
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery(''); // clear query on close
    }
  }, [isSearchOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) setIsSearchOpen(false);
      // Keyboard shortcut Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Real backend search with debounce
  useEffect(() => {
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await api.get(`/notes/search?q=${encodeURIComponent(query)}`);
        setSearchResults(res.data.data.slice(0, 5)); // show max 5 results for now
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15%] sm:pt-[10%] px-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl pointer-events-auto"
            >
              <div className="bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]">
              
              {/* Search Header */}
              <div className="relative flex items-center px-4 h-16 sm:h-20 border-b border-border bg-input-bg/50">
                <Search size={24} className="text-theme-primary shrink-0 mr-4" />
                <input 
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes, tags, or content..."
                  className="flex-1 bg-transparent border-none outline-none text-xl sm:text-2xl text-foreground placeholder:text-foreground/40"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Body */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-surface">
                
                {query.trim() === '' ? (
                  <div className="py-8 px-4 flex flex-col items-center justify-center text-foreground/40">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">Type anything to search...</p>
                    <div className="flex gap-4 mt-6">
                      <div className="flex items-center gap-2 text-sm bg-input-bg px-3 py-1.5 rounded-lg border border-border">
                        <span className="font-bold">Ctrl</span> + <span className="font-bold">K</span>
                      </div>
                    </div>
                  </div>
                ) : isSearching ? (
                  <div className="py-12 px-4 flex flex-col items-center justify-center text-theme-primary">
                    <Loader2 size={32} className="animate-spin mb-2" />
                    <p className="text-sm font-medium">Searching database...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider px-3 mb-2 mt-2">Notes</p>
                    {searchResults.map(note => (
                      <button 
                        key={note._id}
                        onClick={() => {
                          // In a real app, this might navigate to the note or focus it on the canvas
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex flex-col text-left px-4 py-3 rounded-xl hover:bg-input-bg transition-colors group border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${note.color || 'yellow'}-500/10 text-${note.color || 'yellow'}-500 shrink-0`}>
                            <FileText size={18} />
                          </div>
                          <div className="flex-1 truncate">
                            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-theme-primary transition-colors">
                              {note.title || (getPlainText(note.content).substring(0, 25) + (getPlainText(note.content).length > 25 ? '...' : '')) || 'Empty Note'}
                            </h4>
                            <p className="text-xs text-foreground/60 truncate mt-0.5">
                              {getPlainText(note.content) || 'No content...'}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-foreground/40">
                            {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-4 flex flex-col items-center justify-center text-foreground/40">
                    <p className="text-lg font-medium">No results found for "{query}"</p>
                  </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 bg-input-bg/50 border-t border-border flex items-center justify-between text-xs text-foreground/50 font-medium">
                <div className="flex items-center gap-2">
                  <span>Search across all your notes and tags</span>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="bg-surface border border-border rounded px-1.5 py-0.5">↑</span><span className="bg-surface border border-border rounded px-1.5 py-0.5">↓</span> to navigate</span>
                  <span className="flex items-center gap-1"><span className="bg-surface border border-border rounded px-1.5 py-0.5">Enter</span> to select</span>
                  <span className="flex items-center gap-1"><span className="bg-surface border border-border rounded px-1.5 py-0.5">Esc</span> to close</span>
                </div>
              </div>
              
            </div>
          </motion.div>
        </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}