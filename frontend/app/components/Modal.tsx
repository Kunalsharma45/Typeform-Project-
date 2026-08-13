'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ open, onClose, title, children, size = 'sm' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-[440px]',
    md: 'max-w-[500px]',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  const content = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ backgroundColor: 'rgba(70, 62, 72, 0.7)' }}
    >
      <div
        className={`relative w-full ${sizeClass} bg-[#f7f7f8] rounded-[16px] shadow-[0_0_0_3px_rgba(84,80,88,0.09)] overflow-hidden flex flex-col font-sans`}
        style={{ animation: 'modalIn 200ms cubic-bezier(0.175, 0.885, 0.32, 1.15)' }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[20px] font-medium text-[#3c323e] leading-tight tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#655d67] hover:bg-[rgba(89,86,93,0.04)] hover:text-[#4c414e] transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        {/* Body Content */}
        <div className="px-6 pb-6 text-[#4c414e]">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : null;
}
