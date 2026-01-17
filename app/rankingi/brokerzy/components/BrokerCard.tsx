'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import type { Broker } from '../../../../data/brokers';

function Badge({ children, tone = "default" as "default" | "success" | "warn" | "info", href }: { children: React.ReactNode; tone?: "default" | "success" | "warn" | "info"; href?: string }) {
  const tones: Record<string, string> = {
    default: "border-white/10 text-white/80",
    success: "border-emerald-400/30 text-emerald-300",
    warn: "border-amber-400/40 text-amber-300",
    info: "border-sky-400/40 text-sky-300",
  };
  const className = `rounded-md border px-2 py-0.5 text-xs ${tones[tone]} ${href ? 'hover:opacity-80 transition cursor-pointer' : ''}`;
  
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  
  return (
    <span className={className}>{children}</span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-white/90 hover:bg-white/[0.04]"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold">{title}</span>
        <span className="text-white/60">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-3 text-sm text-white/80">{children}</div>}
    </div>
  );
}

export default function BrokerCard({ broker }: { broker: Broker }) {
  const ratingText = typeof broker.rating === "number" ? broker.rating.toFixed(1) : "—";
  const ratingLabel = broker.ratingLabel ?? (typeof broker.rating === "number" ? undefined : "Nowy / brak danych");
  const risks = broker.risks ?? ([] as string[]);
  const quick = (() => {
    const base = broker.pros.slice(0, 4);
    while (base.length < 4) base.push("—");
    return base;
  })();

  return (
    <article className="group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm transition hover:border-blue-400/30 hover:shadow-blue-500/10 motion-reduce:transition-none">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white/90">{broker.name}</h3>
          {broker.trusted && <Badge tone="success">Zaufany</Badge>}
          {broker.statusLabel && <Badge tone="info">{broker.statusLabel}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {ratingLabel && <span className="text-xs text-white/60">{ratingLabel}</span>}
          <div className="rounded-lg bg-yellow-500/15 px-2 py-1 text-sm text-yellow-300">★ {ratingText}</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs text-white/70">
        {broker.platforms.slice(0, 3).map(p => (
          <span key={p} className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">{p}</span>
        ))}
        {broker.platforms.length > 3 && (
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">+{broker.platforms.length - 3}</span>
        )}
        {broker.name !== "Saxo Bank" && broker.name !== "ABF TRADE" && (
          <Badge tone="success" href="/rankingi/brokerzy#weryfikacja-fxedulab">
            ✓ Sprawdzone przez fxedulab
          </Badge>
        )}
        {broker.supportPL && <Badge tone="info">Wsparcie PL</Badge>}
        {broker.vip24h && <Badge tone="info">VIP 24h</Badge>}
        {broker.education && <Badge tone="info">Edukacja</Badge>}
        {broker.promotions && <Badge tone="warn">Promocje</Badge>}
        {broker.regulatedEU && <Badge tone="success">Regulacja: UE</Badge>}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 mb-3">
        <p className="mb-1 text-sm font-semibold text-white/90">Szybki skrót</p>
        <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
          {quick.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>

      <div className="space-y-2">
        <Section title="Plusy">
          <ul className="list-disc pl-5 space-y-1">{broker.pros.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </Section>
        {risks.length > 0 && (
          <Section title="Ryzyka / Na co uważać">
            <ul className="list-disc pl-5 space-y-1">{risks.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Section>
        )}
        {broker.forWho && broker.forWho.length > 0 && (
          <Section title="Dla kogo">
            <ul className="list-disc pl-5 space-y-1">{broker.forWho.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Section>
        )}
        {broker.checkBefore && broker.checkBefore.length > 0 && (
          <Section title="Co sprawdzić przed założeniem konta">
            <ul className="list-disc pl-5 space-y-1">{broker.checkBefore.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </Section>
        )}
      </div>

      {broker.links && broker.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {broker.links.map(link => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:opacity-90"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}


