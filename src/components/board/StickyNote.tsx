"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotesStore, Note, Attachment } from '@/store/useNotesStore';
import { motion } from 'framer-motion';
import { themeConfig } from './note/theme';
import toast from 'react-hot-toast';
import NoteMenu from './note/NoteMenu';
import NoteFooter from './note/NoteFooter';
import NoteComments from './note/NoteComments';
import RichTextEditor, { EditorToolbar } from './note/RichTextEditor';
import AttachmentZone from './note/AttachmentZone';
import StickyNoteHeader from './note/StickyNoteHeader';
import { Link2, ImagePlus, Sparkles, Bot, Wand2, SpellCheck, Undo2 } from 'lucide-react';
import { addConnectionApi } from './ArrowLayer';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import type { Editor } from '@tiptap/react';

interface StickyNoteProps {
  note: Note;
  isGridMode?: boolean;
  isConnecting?: boolean;
  onConnectStart?: (noteId: string) => void;
  onConnectEnd?: (noteId: string) => void;
  emitNoteMove?: (noteId: string, position: { x: number; y: number }) => void;
  emitNoteUpdate?: (noteId: string, updates: Record<string, any>) => void;
}

export default function StickyNote({
  note, isGridMode, isConnecting, onConnectStart, onConnectEnd, emitNoteMove, emitNoteUpdate,
}: StickyNoteProps) {
  const updateNote = useNotesStore(state => state.updateNote);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(note.position);
  const [size, setSize] = useState(note.size);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiBackup, setAiBackup] = useState<string | null>(null);
  const [isFrameMenuOpen, setIsFrameMenuOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  
  const [localTitle, setLocalTitle] = useState(note.title || '');
  useEffect(() => {
    setLocalTitle(note.title || '');
  }, [note.title]);

  const handleAIAction = async (action: string) => {
    if (!editorInstance) return;
    setIsAIProcessing(true);
    setShowAI(false);
    
    // Save backup before AI modifies content
    setAiBackup(editorInstance.getHTML());
    
    const currentText = editorInstance.getText();
    
    if (!currentText.trim()) {
      toast.error('Note is empty! Please write something first.');
      setIsAIProcessing(false);
      return;
    }

    try {
      // Call the real AI API
      const res = await api.post('/ai/edit-note', { action, text: currentText });
      let newText = res.data.data.result;
      
      // Simulated typing effect
      editorInstance.commands.setContent('<p><i>✨ AI is typing...</i></p>');
      
      editorInstance.commands.setContent('');
      
      // Format response based on action
      let finalHtml = '';
      if (action === 'grammar') {
        newText = `✨ Grammar Fixed:\n${newText}`;
        finalHtml = `<p>${newText.replace(/\n/g, '<br>')}</p>`;
      } else if (action === 'summarize') {
        newText = `✨ TL;DR: ${newText}`;
        finalHtml = `<p>${newText.replace(/\n/g, '<br>')}</p>`;
      } else if (action === 'expand') {
        newText = `✨ Expanded Thought:\n${newText}`;
        finalHtml = `<p>${newText.replace(/\n/g, '<br>')}</p>`;
      } else if (action === 'extract-tasks') {
        // AI returns raw HTML for task list
        finalHtml = newText.replace(/```html|```/g, '').trim(); 
      }
      
      // Save to database IMMEDIATELY before animation starts so it won't be lost if user refreshes
      await updateNote(note._id, { content: finalHtml });
      emitNoteUpdate?.(note._id, { content: finalHtml });
      
      if (action !== 'extract-tasks') {
        const chars = newText.split('');
        for (let i = 0; i < chars.length; i++) {
          // If it's a newline, insert a hard break or paragraph, else just insert text
          if (chars[i] === '\n') {
            editorInstance.commands.insertContent('<br>');
          } else {
            editorInstance.commands.insertContent(chars[i]);
          }
          await new Promise(r => setTimeout(r, 5)); // sped up typing to 5ms
        }
      }
      
      // Force final synchronization just to be safe
      editorInstance.commands.setContent(finalHtml);
      toast.success('AI updated note successfully!');
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save AI changes');
      handleRevertAI(); // revert if failed
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleRevertAI = () => {
    if (!editorInstance || !aiBackup) return;
    editorInstance.commands.setContent(aiBackup);
    updateNote(note._id, { content: aiBackup });
    emitNoteUpdate?.(note._id, { content: aiBackup });
    setAiBackup(null);
    toast.success('Reverted AI changes');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAuthStore(state => state.user);

  const isOwner = currentUser?._id === (typeof note.userId === 'object' ? note.userId?._id : note.userId);
  const isReadOnly = !isOwner;

  const currentTheme = note.isFrame
    ? { bg: 'bg-transparent', text: 'text-foreground', border: 'border-2 border-foreground/20 border-dashed', tag: 'bg-black/10 text-foreground' }
    : themeConfig[note.color as keyof typeof themeConfig] || themeConfig.yellow;

  const handleAttachUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded: Attachment[] = [];
      const existing = note.attachments || [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploaded.push({ ...res.data.data, width: 160, height: 110, x: 8 + i * 20, y: 8 + i * 20 });
      }
      updateNote(note._id, { attachments: [...existing, ...uploaded] });
      toast.success('File attached successfully');
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  }, [note._id, note.attachments, updateNote]);

  useEffect(() => {
    if (!isDragging) {
      setPosition(note.position);
      setSize(note.size);
    }
  }, [note.position, note.size, isDragging]);

  // ------------------------------------------------------------------ Drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    // Gather children if it's a frame
    let childNotes: { id: string; startOffsetX: number; startOffsetY: number; originalPos: {x: number, y: number} }[] = [];
    if (note.isFrame) {
      const allNotes = useNotesStore.getState().notes;
      const fw = size.width;
      const fh = size.height;
      const fx = position.x;
      const fy = position.y;

      childNotes = allNotes
        .filter(n => !n.isFrame && n._id !== note._id)
        .filter(n => {
           const cx = n.position.x + n.size.width / 2;
           const cy = n.position.y + n.size.height / 2;
           return cx > fx && cx < fx + fw && cy > fy && cy < fy + fh;
        })
        .map(n => ({
           id: n._id,
           originalPos: { ...n.position },
           startOffsetX: n.position.x - fx,
           startOffsetY: n.position.y - fy,
        }));
    }

    let rafId: number | null = null;
    const handleMove = (moveEvent: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newX = moveEvent.clientX - startX;
        const newY = moveEvent.clientY - startY;
        setPosition({ x: newX, y: newY });
        
        if (note.isFrame && childNotes.length > 0) {
          useNotesStore.getState().setLocalNotePositions(
            childNotes.map(child => ({
              id: child.id,
              position: { x: newX + child.startOffsetX, y: newY + child.startOffsetY }
            }))
          );
        }
      });
    };

    const handleUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      const newPos = { x: upEvent.clientX - startX, y: upEvent.clientY - startY };
      if (newPos.x !== note.position.x || newPos.y !== note.position.y) {
        updateNote(note._id, { position: newPos });
        emitNoteMove?.(note._id, newPos);

        // Save children
        if (note.isFrame) {
          childNotes.forEach(child => {
             const childNewPos = { x: newPos.x + child.startOffsetX, y: newPos.y + child.startOffsetY };
             updateNote(child.id, { position: childNewPos });
             emitNoteMove?.(child.id, childNewPos);
          });
        }
      }
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  // ---------------------------------------------------------------- Resize
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX, startY = e.clientY;
    const startW = size.width, startH = size.height;

    const handleMove = (e: PointerEvent) => setSize({
      width: Math.max(200, startW + (e.clientX - startX)),
      height: Math.max(160, startH + (e.clientY - startY)),
    });
    const handleUp = (e: PointerEvent) => {
      setIsDragging(false);
      const fw = Math.max(200, startW + (e.clientX - startX));
      const fh = Math.max(160, startH + (e.clientY - startY));
      if (fw !== note.size.width || fh !== note.size.height) {
        updateNote(note._id, { size: { width: fw, height: fh } });
      }
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  // We don't need this anymore since we define it above
  // const currentTheme = themeConfig[note.color] || themeConfig.yellow;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${isGridMode ? 'relative' : 'absolute'} shadow-lg rounded-xl flex flex-col group transition-shadow duration-200
        ${currentTheme.bg} ${currentTheme.text} ${note.isFrame ? currentTheme.border : 'shadow-xl hover:shadow-2xl'}
      `}
      style={{
        left:   isGridMode ? 'auto' : position.x,
        top:    isGridMode ? 'auto' : position.y,
        width:  size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: isDragging ? 50 : (note.isFrame ? (isFrameMenuOpen ? 60 : 1) : 10),
        touchAction: 'none',
        outline: isConnecting ? '3px dashed #3b82f6' : 'none',
        outlineOffset: isConnecting ? '4px' : '0px',
      }}
      onPointerDown={isGridMode ? undefined : handlePointerDown}
      onClick={isConnecting && onConnectEnd ? () => onConnectEnd(note._id) : undefined}
    >
      {/* ═══════ UNIFIED HEADER BAR ═══════ */}
      <StickyNoteHeader
        isGridMode={isGridMode}
        isOwner={isOwner}
        isReadOnly={isReadOnly}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        handleAttachUpload={handleAttachUpload}
        onConnectStart={onConnectStart}
        noteId={note._id}
        noteColor={note.color}
        currentTheme={currentTheme}
        showAI={showAI}
        setShowAI={setShowAI}
        isAIProcessing={isAIProcessing}
        aiBackup={aiBackup}
        handleAIAction={handleAIAction}
        handleRevertAI={handleRevertAI}
        editorInstance={editorInstance}
        setIsAddingTag={setIsAddingTag}
        setIsFrameMenuOpen={setIsFrameMenuOpen}
      />

      {/* Note Content (Title + Editor) */}
      <div className="flex-1 px-4 pb-2 no-drag overflow-hidden flex flex-col gap-1 cursor-text">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={() => {
            if (localTitle !== note.title) {
              updateNote(note._id, { title: localTitle });
              emitNoteUpdate?.(note._id, { title: localTitle });
            }
          }}
          readOnly={isReadOnly}
          placeholder="Note title..."
          className={`w-full bg-transparent border-none outline-none font-bold text-lg placeholder:text-current placeholder:opacity-40 ${currentTheme.text}`}
          style={{ fontFamily: 'var(--font-kalam), cursive' }}
        />
        
        <div className="flex-1 overflow-hidden">
          <RichTextEditor
            content={note.content}
            textClass={currentTheme.text}
            onBlur={(html) => {
              updateNote(note._id, { content: html });
              emitNoteUpdate?.(note._id, { content: html });
            }}
            readOnly={isReadOnly}
            onEditorReady={setEditorInstance}
          />
        </div>
      </div>

      {/* Attachments overlay — images float freely, but don't block the editor */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        <AttachmentZone
          noteId={note._id}
          attachments={note.attachments || []}
          textClass={currentTheme.text}
          noteWidth={size.width}
          noteHeight={size.height}
          onAttachmentsChange={(attachments) => updateNote(note._id, { attachments })}
          readOnly={isReadOnly}
        />
      </div>

          {!note.isFrame && (
        <NoteFooter
          noteId={note._id} content={note.content} tags={note.tags} currentTheme={currentTheme}
          isAddingTag={isAddingTag} setIsAddingTag={setIsAddingTag}
          reactions={note.reactions}
          comments={note.comments}
          onCommentClick={() => setIsCommentsOpen(!isCommentsOpen)}
          lastEditedBy={note.lastEditedBy}
          createdAt={note.createdAt}
          updatedAt={note.updatedAt}
          emitNoteUpdate={emitNoteUpdate}
        />
      )}

      {/* Figma-style Comments Thread */}
      {isCommentsOpen && (
        <NoteComments note={note} onClose={() => setIsCommentsOpen(false)} emitNoteUpdate={emitNoteUpdate} />
      )}

      {/* Blue corner accent */}
      {note.color === 'blue' && (
        <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-[#2f55cc] pointer-events-none rounded-br-xl" />
      )}

      {/* Resize handle */}
      {!isGridMode && (
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={handleResizePointerDown}
          style={{ pointerEvents: 'auto' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={note.isFrame ? 'text-foreground/40' : 'text-black/20'}>
            <path d="M9 1L1 9M9 5L5 9" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
