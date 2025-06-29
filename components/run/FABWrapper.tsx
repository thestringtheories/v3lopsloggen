// components/run/FABWrapper.tsx
"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

/**
 * Safe‑area‑aware wrapper som forankrer én eller flere flytende
 * knapper nederst på skjermen – rett over BottomNav og iOS‑Home‑indikatoren.
 * Hele overlayet er `pointer-events-none`, mens selve knappene beholder
 * `pointer-events-auto` slik at kartet under kan dras fritt.
 */
export default function FABWrapper({ children }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col">
      {/* Alt vanlig innhold tar flex‑1 */}
      <div className="flex-1" />

      {/* Dock‑område for knappene */}
      <div
        className="pointer-events-auto flex justify-center pb-4"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        {children}
      </div>
    </div>
  );
}