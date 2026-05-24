"use client";

import { useRef, useState, useCallback } from 'react';
import { Paperclip, X, FileText, ImageIcon } from 'lucide-react';
import api from '@/lib/api';

export interface Attachment {
  url: string;
  type: string;
  name: string;
  width?: number;
  height?: number;
  x?: number;   // position within note
  y?: number;
}

interface AttachmentZoneProps {
  noteId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  textClass: string;
  noteWidth?: number;
  noteHeight?: number;
  readOnly?: boolean;
}

const MIN_SIZE  = 50;
const MAX_SIZE  = 500;
const DEFAULT_W = 160;
const DEFAULT_H = 110;

/** A single image that can be dragged freely and resized via corner handle */
function FloatingImage({ att, index, onChange, onRemove, readOnly }: {
  att: Attachment;
  index: number;
  onChange: (index: number, patch: Partial<Attachment>) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}) {
  const [pos,  setPos]  = useState({ x: att.x  ?? 8, y: att.y  ?? 8 });
  const [size, setSize] = useState({ width: att.width ?? DEFAULT_W, height: att.height ?? DEFAULT_H });
  const [isDragging, setIsDragging] = useState(false);

  // ── Drag to move ─────────────────────────────────────────────────────────
  const handleDragPointerDown = (e: React.PointerEvent) => {
    // Only left button; don't trigger from resize handle or remove btn
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX - startX, y: e.clientY - startY });
    };
    const onUp = (e: PointerEvent) => {
      setIsDragging(false);
      const newPos = { x: e.clientX - startX, y: e.clientY - startY };
      onChange(index, newPos);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // ── Corner resize ─────────────────────────────────────────────────────────
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startW = size.width, startH = size.height;

    const onMove = (e: PointerEvent) => {
      setSize({
        width:  Math.min(MAX_SIZE, Math.max(MIN_SIZE, startW + (e.clientX - startX))),
        height: Math.min(MAX_SIZE, Math.max(MIN_SIZE, startH + (e.clientY - startY))),
      });
    };
    const onUp = (e: PointerEvent) => {
      const fw = Math.min(MAX_SIZE, Math.max(MIN_SIZE, startW + (e.clientX - startX)));
      const fh = Math.min(MAX_SIZE, Math.max(MIN_SIZE, startH + (e.clientY - startY)));
      onChange(index, { width: fw, height: fh });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={`absolute group/img rounded-xl overflow-visible select-none pointer-events-auto`}
      style={{
        left:    pos.x,
        top:     pos.y,
        width:   size.width,
        zIndex:  isDragging ? 99 : 20,
        cursor:  readOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: 'none',
      }}
      onPointerDown={readOnly ? undefined : handleDragPointerDown}
    >
      {/* Image */}
      <div className="rounded-xl overflow-hidden border border-black/20 shadow-lg">
        <img
          src={att.url}
          alt={att.name}
          className="block object-cover w-full"
          style={{ height: size.height }}
          draggable={false}
        />
      </div>

      {/* Remove button (owner only) */}
      {!readOnly && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(index)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500 z-20"
          title="Remove"
        >
          <X size={10} />
        </button>
      )}

      {/* Corner resize handle (owner only) */}
      {!readOnly && (
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-20 flex items-end justify-end p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
          onPointerDown={handleResizePointerDown}
          title="Drag to resize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
            <path d="M9 1L1 9M9 5L5 9" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Size hint */}
      <div className="absolute bottom-1 left-1.5 text-[9px] bg-black/40 text-white px-1 rounded opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
        {Math.round(size.width)}×{Math.round(size.height)}
      </div>
    </div>
  );
}

export default function AttachmentZone({ attachments, onAttachmentsChange, textClass, readOnly }: AttachmentZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded: Attachment[] = [];
      // Stagger positions so images don't stack exactly
      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push({
          ...res.data.data,
          width:  DEFAULT_W,
          height: DEFAULT_H,
          x: 8 + idx * 20,
          y: 8 + idx * 20,
        });
      }
      onAttachmentsChange([...attachments, ...uploaded]);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  }, [attachments, onAttachmentsChange]);

  const handleRemove = (index: number) =>
    onAttachmentsChange(attachments.filter((_, i) => i !== index));

  const handleChange = (index: number, patch: Partial<Attachment>) =>
    onAttachmentsChange(attachments.map((a, i) => i === index ? { ...a, ...patch } : a));

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const imageAttachments = attachments.filter(a => a.type === 'image');
  const fileAttachments  = attachments.filter(a => a.type !== 'image');

  return (
    <>
      {/* Absolutely positioned floating images */}
      {imageAttachments.map((att, i) => {
        const globalIndex = attachments.indexOf(att);
        return (
          <FloatingImage
            key={globalIndex}
            att={att}
            index={globalIndex}
            onChange={handleChange}
            onRemove={handleRemove}
            readOnly={readOnly}
          />
        );
      })}

      {/* File attachments list */}
      <div
        className="no-drag relative z-30 flex flex-col gap-1 px-3 pb-2 pointer-events-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {fileAttachments.map((att) => {
          const gIdx = attachments.indexOf(att);
          return (
            <div key={gIdx} className="flex items-center gap-2 group/att">
              <a href={att.url} target="_blank" rel="noreferrer"
                className={`flex items-center gap-1.5 text-[11px] flex-1 truncate hover:underline ${textClass}`}>
                <FileText size={13} />
                <span className="truncate">{att.name}</span>
              </a>
              <button onClick={() => handleRemove(gIdx)} className="opacity-0 group-hover/att:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity">
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
