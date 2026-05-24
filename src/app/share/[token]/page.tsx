"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { themeConfig } from '@/components/board/note/theme';
import { StickyNote as StickyNoteIcon } from 'lucide-react';

const renderHighlightedText = (text: string, theme: any) => {
  if (!text) return null;
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  const parts = text.split(hashtagRegex);
  
  return parts.map((part, i) => {
    if (part.match(hashtagRegex)) {
      return <span key={i} className={`font-bold transition-all ${theme.highlight}`}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function SharedNotePage({ params }: { params: { token: string } }) {
  const [note, setNote] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/notes/share/${params.token}`)
      .then(res => setNote(res.data.data))
      .catch(() => setError('Note not found, is private, or link has expired.'));
  }, [params.token]);

  if (error) {
    return (
      <div className="min-h-screen premium-canvas-bg flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-2xl shadow-xl border border-red-100 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xl font-bold">!</div>
          <p className="text-slate-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen premium-canvas-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  const currentTheme = themeConfig[note.color] || themeConfig.yellow;
  const noteWidth = note.size?.width || 350;
  const noteHeight = note.size?.height || 350;

  return (
    <div className="min-h-screen w-full premium-canvas-bg flex flex-col items-center">
      {/* Premium Header */}
      <div className="w-full h-[60px] bg-white/40 backdrop-blur-md flex items-center px-8 border-b border-black/5 shadow-sm">
        <div className="flex items-center gap-2.5 text-[#1b49e0]">
          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-blue-100">
            <StickyNoteIcon size={20} className="text-[#1b49e0] fill-blue-50" />
          </div>
          <span className="font-bold text-lg tracking-tight">StickyNotes</span>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full">
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`relative shadow-2xl rounded-xl ${currentTheme.bg} ${currentTheme.border || ''} flex flex-col`}
          style={{ width: noteWidth, minHeight: noteHeight, maxWidth: '100%' }}
        >
          {/* Note Content */}
          <div className="flex-1 p-5 pt-8 overflow-y-auto custom-scrollbar">
            {note.title && (
              <h2 className={`font-bold text-xl mb-2 ${currentTheme.text}`} style={{ fontFamily: 'var(--font-kalam), cursive' }}>
                {note.title}
              </h2>
            )}
            
            <div 
              className={`whitespace-pre-wrap break-words ${currentTheme.text} tiptap-readonly`}
              style={{ 
                fontFamily: 'var(--font-kalam), cursive',
                fontSize: '1.25rem',
                lineHeight: '1.5'
              }}
              dangerouslySetInnerHTML={{ __html: note.content || '' }}
            />
          </div>

          {/* Note Footer */}
          <div className="px-4 pb-3 flex items-end justify-between">
            <div className="flex gap-1.5 flex-wrap max-w-[60%]">
              {note.tags && note.tags.length > 0 ? (
                note.tags.map((tag: string, idx: number) => (
                  <div key={idx} className={`px-2.5 py-1 bg-black/5 rounded-full text-[10px] font-bold ${currentTheme.text} opacity-70 uppercase tracking-wider`}>
                    {tag}
                  </div>
                ))
              ) : (
                <span className={`px-2.5 py-1 bg-black/5 rounded-full text-[10px] font-bold ${currentTheme.text} opacity-70 uppercase tracking-wider`}>
                  {currentTheme.tag}
                </span>
              )}
            </div>

            <div className="flex flex-col items-end gap-0.5">
              {note.lastEditedBy && (
                <span className={`text-[9px] ${currentTheme.text} opacity-40 flex items-center gap-1`}>
                  ✏️ Edited{note.lastEditedBy ? ` by ${note.lastEditedBy}` : ''}
                </span>
              )}
              <span className={`text-[12px] font-bold ${currentTheme.text} opacity-80 tracking-wide flex items-center gap-1.5`}>
                <span className="text-red-500 animate-pulse">❤️</span> {note.userId?.name || 'User'}
              </span>
            </div>
          </div>

          {/* Attachments — rendered at their saved positions */}
          {note.attachments && note.attachments.length > 0 &&
            note.attachments.map((att: any, i: number) =>
              att.type === 'image' ? (
                <a key={i} href={att.url} target="_blank" rel="noreferrer"
                  className="absolute block rounded-xl overflow-hidden border border-black/10 shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    left:   att.x ?? 8,
                    top:    att.y ?? 8,
                    width:  att.width || 160,
                    height: att.height || 110,
                    zIndex: 15,
                  }}
                >
                  <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                </a>
              ) : (
                <a key={i} href={att.url} target="_blank" rel="noreferrer"
                  className={`absolute flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-colors ${currentTheme.text}`}
                  style={{ left: att.x ?? 8, top: att.y ?? 8, zIndex: 15 }}
                >
                  📄 <span className="truncate max-w-[120px]">{att.name}</span>
                </a>
              )
            )
          }
          
          {/* Blue Note Corner Detail */}
          {note.color === 'blue' && (
            <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-b-[24px] border-b-[#2f55cc]" />
          )}
        </motion.div>
        
        {/* Branding Footer */}
        <p className="mt-10 text-xs text-slate-500 font-medium tracking-wide">Created with ✨ StickyNotes</p>
      </div>
    </div>
  );
}
