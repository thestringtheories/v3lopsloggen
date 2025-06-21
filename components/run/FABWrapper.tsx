// components/run/FABWrapper.tsx
"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

/**
 * A safe‑area‑aware wrapper (three words) that pins its children (normally one or two
 * floating action buttons) nederst på skjermen – rett over BottomNav og
 * iOS‑Home‑indikatoren.  
 * Hele overlayet er `pointer-events-none` slik at kartet under kan dras, men
 * selve knappene beholder `pointer-events-auto`.
 */
export default function FABWrapper({ children }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col">
      {/* Alt vanlig innhold tar flex‑1 */}
      <div className="flex-1" />

      {/* Dock‑område for knappen(e) */}
      <div
        className="pointer-events-auto flex justify-center pb-4"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        {children}
      </div>
    </div>
  );
}
