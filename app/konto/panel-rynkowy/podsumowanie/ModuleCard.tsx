'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type ModuleCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  tier: 'starter' | 'pro' | 'elite';
  delay?: number;
  children: React.ReactNode;
};

const tierColors = {
  starter: {
    border: 'border-blue-400/30',
    bg: 'bg-blue-500/10',
    accent: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    divider: 'bg-blue-400/20',
    glow: 'from-blue-400/20',
  },
  pro: {
    border: 'border-purple-400/30',
    bg: 'bg-purple-500/10',
    accent: 'text-purple-300',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    divider: 'bg-purple-400/20',
    glow: 'from-purple-400/20',
  },
  elite: {
    border: 'border-amber-400/30',
    bg: 'bg-amber-500/10',
    accent: 'text-amber-300',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    divider: 'bg-amber-400/20',
    glow: 'from-amber-400/20',
  },
};

export default function ModuleCard({
  title,
  description,
  icon,
  href,
  tier,
  delay = 0,
  children,
}: ModuleCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = tierColors[tier];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} transition-all duration-700 ease-out hover:border-opacity-50 ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <div className={colors.accent}>
                {icon}
              </div>
            </div>
            
            {/* Title and description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
                  {tier.toUpperCase()}
                </span>
              </div>
              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          
          {/* Link */}
          <Link
            href={href}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${colors.bg} border ${colors.border} text-sm font-semibold ${colors.accent} hover:scale-105 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-white/40`}
          >
            Otwórz
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Divider */}
        <div className={`h-px ${colors.divider} mb-6 transition-all duration-300 group-hover:opacity-50`} />

        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>

      {/* Animated border glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.glow} via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-700 pointer-events-none ${
          isVisible ? 'opacity-30' : 'opacity-0'
        }`}
        style={{ transitionDelay: `${delay + 200}ms` }}
      />
    </div>
  );
}
