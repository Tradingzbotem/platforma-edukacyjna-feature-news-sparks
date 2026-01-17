'use client';

import { useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { RefreshCw, CheckCircle2, XCircle, Calendar, Info } from 'lucide-react';

type RefreshStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  eventsCount?: number;
  timestamp?: string;
};

export default function AdminCalendarPage() {
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>({ status: 'idle' });
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshStatus({ status: 'loading', message: 'Odświeżanie kalendarza...' });
    try {
      const res = await fetch('/api/admin/calendar/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setRefreshStatus({
          status: 'success',
          message: data.message || 'Kalendarz został odświeżony pomyślnie',
          eventsCount: data.eventsCount,
          timestamp: new Date().toISOString(),
        });
        setLastRefresh(new Date().toLocaleString('pl-PL'));
      } else {
        setRefreshStatus({
          status: 'error',
          message: data.error || 'Błąd podczas odświeżania kalendarza',
        });
      }
    } catch (error: any) {
      setRefreshStatus({
        status: 'error',
        message: error?.message || 'Nie udało się połączyć z serwerem',
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4">
          <BackButton />
        </nav>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-indigo-400" />
              <h1 className="text-2xl font-bold">Kalendarz makro — 30 dni (EDU)</h1>
            </div>
            <Link
              href="/konto/panel-rynkowy/kalendarz-7-dni"
              target="_blank"
              className="inline-flex items-center rounded-md bg-white/10 text-white px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
            >
              Zobacz kalendarz
            </Link>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Odśwież kalendarz makro, aby zaktualizować dane dla wszystkich klientów. Dane są pobierane z Finnhub API
            i przetwarzane przez AI.
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Status odświeżania</h2>
              {refreshStatus.status === 'idle' && (
                <div className="flex items-center gap-2 text-white/70">
                  <Info className="h-5 w-5" />
                  <span>Kliknij przycisk poniżej, aby odświeżyć kalendarz</span>
                </div>
              )}
              {refreshStatus.status === 'loading' && (
                <div className="flex items-center gap-2 text-amber-300">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>{refreshStatus.message}</span>
                </div>
              )}
              {refreshStatus.status === 'success' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">{refreshStatus.message}</span>
                  </div>
                  {refreshStatus.eventsCount !== undefined && (
                    <div className="text-sm text-white/70 ml-7">
                      Pobrano {refreshStatus.eventsCount} wydarzeń
                    </div>
                  )}
                  {refreshStatus.timestamp && (
                    <div className="text-sm text-white/50 ml-7">
                      Ostatnie odświeżenie: {lastRefresh}
                    </div>
                  )}
                </div>
              )}
              {refreshStatus.status === 'error' && (
                <div className="flex items-center gap-2 text-red-300">
                  <XCircle className="h-5 w-5" />
                  <span>{refreshStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Akcje</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshStatus.status === 'loading'}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-6 py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshStatus.status === 'loading' ? 'animate-spin' : ''}`}
            />
            {refreshStatus.status === 'loading' ? 'Odświeżanie...' : 'Odśwież kalendarz'}
          </button>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200 space-y-2">
              <p className="font-semibold">Jak działa odświeżanie?</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-200/90">
                <li>System pobiera dane z Finnhub Economic Calendar API</li>
                <li>Jeśli Finnhub nie zwraca danych, używany jest fallback EDU</li>
                <li>Dane są przetwarzane przez AI (GPT) w celu rankingu i normalizacji</li>
                <li>Zaktualizowane wydarzenia są dostępne dla wszystkich klientów</li>
                <li>Odświeżanie może potrwać kilka sekund</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
