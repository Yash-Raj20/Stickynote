import React from 'react';
import { ImagePlus, Link2, Sparkles, Undo2, Bot, SpellCheck, Wand2, ListChecks } from 'lucide-react';
import NoteMenu from './NoteMenu';
import { EditorToolbar } from './RichTextEditor';
import type { Editor } from '@tiptap/react';

interface StickyNoteHeaderProps {
  isGridMode?: boolean;
  isOwner: boolean;
  isReadOnly: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAttachUpload: (files: FileList | null) => void;
  onConnectStart?: (noteId: string) => void;
  noteId: string;
  noteColor: string;
  currentTheme: any;
  showAI: boolean;
  setShowAI: (show: boolean) => void;
  isAIProcessing: boolean;
  aiBackup: string | null;
  handleAIAction: (action: string) => void;
  handleRevertAI: () => void;
  editorInstance: Editor | null;
  setIsAddingTag: (adding: boolean) => void;
  setIsFrameMenuOpen: (open: boolean) => void;
}

export default function StickyNoteHeader({
  isGridMode, isOwner, isReadOnly, isUploading, fileInputRef, handleAttachUpload,
  onConnectStart, noteId, noteColor, currentTheme, showAI, setShowAI,
  isAIProcessing, aiBackup, handleAIAction, handleRevertAI, editorInstance,
  setIsAddingTag, setIsFrameMenuOpen
}: StickyNoteHeaderProps) {
  return (
    <div 
      className={`flex items-center px-2 pt-2 border-b border-transparent group-hover:border-black/10 transition-colors duration-200 z-20 gap-0.5 ${!isGridMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center gap-0.5 flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {isOwner && (
          <div className="flex items-center gap-0.5 no-drag">
            {/* Attach image */}
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className={`p-1 rounded hover:bg-black/10 transition-colors cursor-pointer ${currentTheme.text}`}
              title="Attach image"
            >
              {isUploading
                ? <span className="w-4 h-4 flex items-center justify-center"><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /></span>
                : <ImagePlus size={15} />}
            </button>
            <input
              ref={fileInputRef}
              type="file" className="hidden" multiple accept="image/*,.pdf"
              onChange={(e) => handleAttachUpload(e.target.files)}
            />

            {/* Connect arrow */}
            {!isGridMode && onConnectStart && (
              <button
                onClick={(e) => { e.stopPropagation(); onConnectStart(noteId); }}
                className={`p-1 rounded hover:bg-black/10 transition-colors cursor-pointer ${currentTheme.text}`}
                title="Draw connection arrow"
              >
                <Link2 size={15} />
              </button>
            )}

            {/* AI Assistant */}
            <div className="relative">
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAI(!showAI); }}
                  className={`p-1 rounded-full cursor-pointer bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-primary animate-magic-gradient text-white dark:text-slate-900 shadow-sm transition-all hover:scale-110 ${isAIProcessing ? 'animate-pulse' : ''}`}
                  title="Ask AI"
                >
                  <Sparkles size={13} className="text-white dark:text-slate-900" />
                </button>
                {aiBackup && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRevertAI(); }}
                    className={`p-1 rounded hover:bg-black/10 transition-colors cursor-pointer ${currentTheme.text}`}
                    title="Undo AI changes"
                  >
                    <Undo2 size={15} />
                  </button>
                )}
              </div>
              {showAI && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface border border-border shadow-lg rounded-xl py-1.5 flex flex-col min-w-[140px] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button onClick={(e) => { e.stopPropagation(); handleAIAction('extract-tasks'); }} className="text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 transition-colors">
                    <ListChecks size={13} className="text-orange-500" /> Extract Tasks
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleAIAction('summarize'); }} className="text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 transition-colors">
                    <Bot size={13} className="text-blue-500" /> Summarize
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleAIAction('grammar'); }} className="text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 transition-colors">
                    <SpellCheck size={13} className="text-green-500" /> Fix Grammar
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleAIAction('expand'); }} className="text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2 transition-colors">
                    <Wand2 size={13} className="text-purple-500" /> Expand Idea
                  </button>
                </div>
              )}
            </div>

            {/* Text formatting toolbar */}
            <EditorToolbar editor={editorInstance} />
          </div>
        )}

        {/* Read-only indicator */}
        {!isOwner && (
          <span className={`text-[10px] ${currentTheme.text} opacity-40 px-1`}>👁️ View only</span>
        )}
      </div>

      {/* RIGHT: 3-dot menu */}
      {isOwner && (
        <NoteMenu
          noteId={noteId} color={noteColor} currentTheme={currentTheme}
          onAddTagClick={() => setIsAddingTag(true)}
          onMenuOpenChange={setIsFrameMenuOpen}
        />
      )}
    </div>
  );
}
