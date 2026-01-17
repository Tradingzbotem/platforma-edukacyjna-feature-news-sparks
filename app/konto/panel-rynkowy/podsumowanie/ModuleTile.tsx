'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

type ModuleTileProps = {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  tier: 'starter' | 'pro' | 'elite';
};

const tierColors = {
  starter: {
    border: 'border-blue-400/30',
    bg: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/15',
    accent: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    glow: 'from-blue-400/20',
  },
  pro: {
    border: 'border-purple-400/30',
    bg: 'bg-purple-500/10',
    hoverBg: 'hover:bg-purple-500/15',
    accent: 'text-purple-300',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    glow: 'from-purple-400/20',
  },
  elite: {
    border: 'border-amber-400/30',
    bg: 'bg-amber-500/10',
    hoverBg: 'hover:bg-amber-500/15',
    accent: 'text-amber-300',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    glow: 'from-amber-400/20',
  },
};

export default function ModuleTile({
  title,
  description,
  icon,
  href,
  tier,
}: ModuleTileProps) {
  const colors = tierColors[tier];

  return (
    <Link
      href={href}
      aria-label={`Zobacz podsumowanie modułu ${title}`}
      className={`group relative block h-full rounded-2xl border-2 ${colors.border} ${colors.bg} ${colors.hoverBg} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-white/40 cursor-pointer`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
      
      {/* Content */}
      <div className="relative p-6 md:p-8 h-full flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-start gap-4 mb-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <div className={colors.accent}>
                {icon}
              </div>
            </div>
            
            {/* Title and badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
                  {tier.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6">
            {description}
          </p>
        </div>

        {/* Footer with arrow */}
        <div className="pt-4 border-t border-white/10">
          <div className={`flex items-center gap-2 text-sm font-semibold ${colors.accent} group-hover:translate-x-1 transition-transform duration-200`}>
            <span>Zobacz podsumowanie</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Animated border glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.glow} via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-500 pointer-events-none group-hover:opacity-30`}
      />
    </Link>
  );
}
