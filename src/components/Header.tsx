'use client';

import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  showBack?: boolean;
}

export default function Header({ showBack = false }: HeaderProps) {
  return (
    <header className="z-50 w-full shadow-sm bg-[#FFF2E1]/90 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href="/"
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-tertiary/20 hover:bg-tertiary/40 transition-colors"
            aria-label="Back to home"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 relative flex items-center justify-center">
            <Image src="/assets/logo.png" alt="AralNook Logo" fill className="object-contain" priority />
          </div>
        </Link>
      </div>
    </header>
  );
}
