'use client';

import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Notebook from './Notebook';

interface MobileNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Notebook renders cleanly at 1060px+ (matches desktop internal max-w)
const NOTEBOOK_WIDTH = 1060;

export default function MobileNotebookModal({ isOpen, onClose }: MobileNotebookModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      // Center the notebook horizontally on open
      if (scrollContainerRef.current) {
        const viewportW = scrollContainerRef.current.clientWidth;
        const offset = Math.max(0, (NOTEBOOK_WIDTH - viewportW) / 2);
        scrollContainerRef.current.scrollLeft = offset;
      }

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex flex-col animate-in fade-in duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Close button */}
      <div
        className="w-full flex items-center justify-end px-3 py-2 shrink-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
          aria-label="Close notebook"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontally scrollable at desktop width so text stays within notebook bounds */}
      <div
        ref={scrollContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 w-full overflow-x-auto overflow-y-hidden touch-pan-x flex items-center scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Exact desktop internal max-width — text fits cleanly at this size */}
        <div
          className="shrink-0 px-4 flex items-center"
          style={{ width: `${NOTEBOOK_WIDTH + 32}px` }}
        >
          <Notebook
            forceAnimated={true}
            hideTextOnMobile={false}
            className="w-full max-w-none"
          />
        </div>
      </div>

      {/* Bottom hint */}
      <div
        className="w-full text-center py-1.5 text-white/50 text-[11px] shrink-0 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <span>← Slide to explore →</span>
      </div>
    </div>
  );
}
