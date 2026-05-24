"use client";

import { useState } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeConfig } from './theme';
import { Pencil, SmilePlus, MessageSquare } from 'lucide-react';

interface NoteFooterProps {
  noteId: string;
  content: string;
  tags: string[];
  reactions?: Record<string, string[]>;
  currentTheme: ThemeConfig;
  isAddingTag: boolean;
  setIsAddingTag: (val: boolean) => void;
  lastEditedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  emitNoteUpdate?: (id: string, updates: Partial<any>) => void;
  comments?: any[];
  onCommentClick?: () => void;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NoteFooter({
  noteId, content, tags, reactions = {}, currentTheme, isAddingTag, setIsAddingTag,
  lastEditedBy, createdAt, updatedAt, emitNoteUpdate, comments = [], onCommentClick
}: NoteFooterProps) {
  const updateNote = useNotesStore(state => state.updateNote);
  const user = useAuthStore(state => state.user);
  const [newTagValue, setNewTagValue] = useState('');
  const [showReactions, setShowReactions] = useState(false);

  const isEdited = !!lastEditedBy;

  const toggleReaction = (emoji: string) => {
    if (!user) return;
    const userName = user.name || (user.email ? user.email.split('@')[0] : 'Anonymous');
    const currentReactions = { ...reactions };
    const usersForEmoji = (currentReactions[emoji] || []).filter(Boolean); // remove undefined/null
    
    if (usersForEmoji.includes(userName)) {
      currentReactions[emoji] = usersForEmoji.filter(u => u !== userName);
      if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
    } else {
      currentReactions[emoji] = [...usersForEmoji, userName];
    }
    
    updateNote(noteId, { reactions: currentReactions });
    emitNoteUpdate?.(noteId, { reactions: currentReactions });
    setShowReactions(false);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTagValue.trim()) {
      const updatedTags = [...(tags || []), newTagValue.trim().toUpperCase()];
      updateNote(noteId, { tags: updatedTags });
      emitNoteUpdate?.(noteId, { tags: updatedTags });
      setNewTagValue('');
      setIsAddingTag(false);
    } else if (e.key === 'Escape') {
      setIsAddingTag(false);
      setNewTagValue('');
    }
  };

  // Checklists Progress
  let totalTasks = 0;
  let completedTasks = 0;
  
  if (content) {
    const taskMatches = content.match(/data-type="taskItem"/g);
    if (taskMatches) totalTasks = taskMatches.length;
    
    const checkedMatches = content.match(/data-checked="true"/g);
    if (checkedMatches) completedTasks = checkedMatches.length;
  }
  const hasTasks = totalTasks > 0;
  const progressPercent = hasTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="px-4 pb-3 flex flex-col gap-2 pointer-events-none">


      {/* Reactions Row */}
      <div className={`flex gap-1 flex-wrap pointer-events-auto w-full items-center mb-1 z-30 relative transition-opacity ${Object.keys(reactions).length > 0 || showReactions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {Object.entries(reactions).map(([emoji, usersRaw]) => {
          const users = usersRaw.filter(Boolean); // filter out null/undefined
          if (users.length === 0) return null;
          const currentUserName = user?.name || (user?.email ? user.email.split('@')[0] : 'Anonymous');
          return (
            <button
              key={emoji}
              onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
              className={`px-1.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 transition-colors border ${users.includes(currentUserName) ? 'bg-black/10 border-black/20' : 'bg-white/30 border-black/5 hover:bg-black/5'}`}
              title={users.join(', ')}
            >
              <span>{emoji}</span>
              <span className={`font-bold opacity-80 ${currentTheme.text}`}>{users.length}</span>
            </button>
          );
        })}
        
        <div className="relative flex items-center gap-1">
          {/* Reaction Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setShowReactions(!showReactions); }}
            className={`p-1 rounded-full hover:bg-black/10 transition-colors opacity-60 hover:opacity-100 ${currentTheme.text}`}
            title="Add reaction"
          >
            <SmilePlus size={14} />
          </button>
          
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-surface border border-border shadow-lg rounded-full px-2 py-1 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
              {['👍', '❤️', '😂', '💡', '🎉'].map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => { e.stopPropagation(); toggleReaction(emoji); }}
                  className="hover:scale-125 transition-transform p-1 text-base"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Comment Button */}
          {onCommentClick && (
            <button 
              onClick={(e) => { e.stopPropagation(); onCommentClick(); }}
              className={`p-1 rounded-full hover:bg-black/10 transition-colors flex items-center gap-1 opacity-60 hover:opacity-100 ${currentTheme.text}`}
              title="Comments"
            >
              <MessageSquare size={14} />
              {comments && comments.length > 0 && <span className="text-[10px] font-bold">{comments.length}</span>}
            </button>
          )}
        </div>
      </div>

      {/* Tags + Edited row */}
      <div className="flex items-end justify-between">
        <div className="flex gap-1.5 flex-wrap pointer-events-auto max-w-[65%] no-drag z-20">
          {isAddingTag ? (
            <input 
              autoFocus
              type="text"
              value={newTagValue}
              onChange={(e) => setNewTagValue(e.target.value)}
              onKeyDown={handleAddTag}
              onBlur={() => setIsAddingTag(false)}
              className={`w-20 px-2 py-0.5 bg-black/10 rounded-sm text-[10px] font-bold ${currentTheme.text} outline-none uppercase placeholder:text-black/30 placeholder:normal-case`}
              placeholder="New tag..."
            />
          ) : (
            <>
              {tags && tags.length > 0 ? (
                tags.map((tag, idx) => (
                  <div key={idx} className={`group/tag relative px-2.5 py-1 bg-black/5 rounded-full text-[10px] font-bold ${currentTheme.text} opacity-70 uppercase tracking-wider flex items-center gap-1`}>
                    {tag}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newTags = tags.filter((_, i) => i !== idx);
                        updateNote(noteId, { tags: newTags });
                      }}
                      className="hidden group-hover/tag:block opacity-50 hover:opacity-100 transition-opacity ml-1 -mr-1"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <span className={`px-2.5 py-1 bg-black/5 rounded-full text-[10px] font-bold ${currentTheme.text} opacity-80 uppercase tracking-wider`}>
                  {currentTheme.tag}
                </span>
              )}
            </>
          )}
        </div>

        {/* Edited badge */}
        {isEdited && (
          <div
            className={`flex items-center gap-1 text-[9px] ${currentTheme.text} opacity-70 shrink-0`}
            title={`Last edited by ${lastEditedBy || 'owner'} · ${timeAgo(updatedAt)}`}
          >
            <Pencil size={9} />
            <span className="truncate max-w-[80px]">Edited{lastEditedBy ? ` · ${lastEditedBy}` : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
