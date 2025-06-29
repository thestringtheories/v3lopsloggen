// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';            // valgfritt ikon

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--header-h)]
                       bg-white/90 backdrop-blur border-b border-neutral-200 shadow-sm">
      <div className="mx-auto flex h-full max-w-5xl items-center px-4">
        {/* Logo / app-navn */}
        <Link href="/" className="text-primary text-2xl font-extrabold tracking-tight">
          Løpsloggen
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {/* Valgfritt innstillings-ikon */}
          <Link href="/settings" aria-label="Innstillinger"
                className="p-2 hover:bg-neutral-200/60 rounded-lg transition">
            <Settings className="h-5 w-5 text-neutral-700" />
          </Link>
        </div>
      </div>
    </header>
  );
}