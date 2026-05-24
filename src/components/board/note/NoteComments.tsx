import { useState, useRef, useEffect } from 'react';
import { useNotesStore, Note } from '@/store/useNotesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MessageSquare, X, Trash2, Send } from 'lucide-react';

interface NoteCommentsProps {
  note: Note;
  onClose: () => void;
  emitNoteUpdate?: (id: string, updates: Partial<any>) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function NoteComments({ note, onClose, emitNoteUpdate }: NoteCommentsProps) {
  const user = useAuthStore(state => state.user);
  const addComment = useNotesStore(state => state.addComment);
  const deleteComment = useNotesStore(state => state.deleteComment);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [note.comments]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment(note._id, newComment);
      const updatedNote = useNotesStore.getState().notes.find(n => n._id === note._id);
      if (updatedNote) {
        emitNoteUpdate?.(note._id, { comments: updatedNote.comments });
      }
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const comments = note.comments || [];

  return (
    <div 
      className="absolute top-0 -right-80 w-72 bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col z-[100] no-drag text-slate-800 dark:text-slate-200"
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
      style={{ height: Math.max(300, note.size.height) }}
    >
      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/20">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">
          <MessageSquare size={16} />
          <span>Comments {comments.length > 0 && `(${comments.length})`}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-slate-500 dark:text-slate-400 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {comments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
            <MessageSquare size={32} strokeWidth={1} />
            <p className="text-sm">No comments yet</p>
          </div>
        ) : (
          comments.map(c => {
            const isMe = user?.id === c.userId || user?._id === c.userId;
            const canDelete = isMe || user?.id === (typeof note.userId === 'object' ? note.userId?._id : note.userId);
            
            return (
              <div key={c.id} className="group relative flex gap-2.5 text-sm p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                {/* Avatar */}
                {c.userAvatar ? (
                  <img src={c.userAvatar} alt={c.userName} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 dark:border-white/10" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-500/30">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">{c.userName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">{timeAgo(c.createdAt)}</span>
                    </div>
                    
                    {canDelete && (
                      <button 
                        onClick={async () => {
                          await deleteComment(note._id, c.id);
                          const updatedNote = useNotesStore.getState().notes.find(n => n._id === note._id);
                          if (updatedNote) {
                            emitNoteUpdate?.(note._id, { comments: updatedNote.comments });
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-slate-700 dark:text-slate-300 text-[13px] leading-relaxed break-words mt-0.5 pr-2">
                    {c.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleAdd} className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
        <div className="relative flex items-center">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-white dark:bg-[#25252d] border border-slate-200 dark:border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
            className="absolute right-2 p-1.5 text-indigo-600 dark:text-indigo-400 disabled:text-slate-400 dark:disabled:text-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
