'use client';

import React from 'react';

export function Section({ title, right, children }:{
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {right}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, hint }:{ label:string; value:string|number|undefined; hint?: string }) {
  return (
    <div
      className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-center min-h-[64px] flex flex-col items-center justify-center"
      title={hint || undefined}
    >
      <div className="text-lg md:text-xl font-bold leading-tight truncate max-w-[120px]">
        {value === undefined || value === null || value === '' ? '—' : String(value)}
      </div>
      <div className="text-[11px] text-white/70 mt-0.5 leading-none">{label}</div>
    </div>
  );
}

export function BannerError({ children }:{ children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 p-3 text-sm">
      {children}
    </div>
  );
}

export function Button({ children, ...props }:{
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }:{
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
    >
      {children}
    </button>
  );
}


