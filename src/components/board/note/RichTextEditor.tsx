"use client";

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';

import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CheckSquare } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onBlur: (html: string) => void;
  textClass: string;
  readOnly?: boolean;
  /** Called once editor is ready — parent renders toolbar externally */
  onEditorReady?: (editor: Editor) => void;
}

export default function RichTextEditor({
  content, onBlur, textClass, readOnly = false, onEditorReady,
}: RichTextEditorProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Placeholder.configure({ placeholder: 'Type something...' }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable: !readOnly,
    onBlur: ({ editor }) => onBlur(editor.getHTML()),
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onBlur(editor.getHTML());
      }, 500);
    },
    editorProps: {
      attributes: {
        class: `outline-none w-full min-h-[80px] pb-2 ${textClass} tiptap-editor`,
        style: `font-family: var(--font-kalam), cursive; font-size: 1.2rem; line-height: 1.6;`,
      },
    },
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (readOnly) {
    return (
      <div
        className={`tiptap-readonly h-full overflow-y-auto custom-scrollbar pb-2 ${textClass} tiptap-editor`}
        style={{ fontFamily: 'var(--font-kalam), cursive', fontSize: '1.2rem', lineHeight: '1.6' }}
        dangerouslySetInnerHTML={{ __html: content }}
        onWheel={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar no-drag" onWheel={(e) => e.stopPropagation()}>
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}

/** Standalone toolbar rendered in the parent header bar */
export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
        <span className="font-bold text-[12px] md:text-sm">B</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
        <span className="italic text-[12px] md:text-sm">I</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <span className="line-through text-[12px] md:text-sm">S</span>
      </ToolbarBtn>
      <div className="w-px h-3 bg-black/20 mx-0.5 self-center" />
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
        <span className="text-[12px] md:text-sm">≡</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
        <span className="text-[12px] md:text-sm">≡₁</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task list">
        <CheckSquare size={13} strokeWidth={2.5} />
      </ToolbarBtn>
    </>
  );
}

function ToolbarBtn({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer ${active ? 'bg-black/15' : 'hover:bg-black/10'}`}
    >
      {children}
    </button>
  );
}
