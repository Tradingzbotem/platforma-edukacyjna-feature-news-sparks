'use client';

import { useEffect, useState } from 'react';
import { Crown, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type TrialStatus = {
  hasRequest: boolean;
  status: 'pending' | 'active' | 'expired' | null;
  requestedAt: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
};

export default function EliteTrialRequest() {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch both trial status and tier
        const [trialRes, tierRes] = await Promise.all([
          fetch('/api/trial/elite/status', { cache: 'no-store' }),
          fetch('/api/panel/me', { cache: 'no-store' }),
        ]);
        
        if (!mounted) return;
        
        if (trialRes.ok) {
          try {
            const trialData = await trialRes.json();
            if (trialData && trialData.ok) {
              setStatus(trialData);
            }
          } catch (e) {
            console.error('Error parsing trial status:', e);
          }
        }
        
        if (tierRes.ok) {
          try {
            const tierData = await tierRes.json();
            if (tierData && tierData.tier) {
              setTier(tierData.tier);
            }
          } catch (e) {
            console.error('Error parsing tier data:', e);
          }
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Błąd połączenia');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRequest = async () => {
    setRequesting(true);
    setError(null);
    try {
      const r = await fetch('/api/trial/elite/request', {
        method: 'POST',
        cache: 'no-store',
      });
      if (!r.ok) {
        let errorMessage = `HTTP ${r.status}`;
        try {
          const data = await r.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Ignore JSON parse errors, use default message
        }
        throw new Error(errorMessage);
      }
      // Refresh status
      const statusRes = await fetch('/api/trial/elite/status', { cache: 'no-store' });
      if (statusRes.ok) {
        try {
          const statusData = await statusRes.json();
          if (statusData && statusData.ok) {
            setStatus(statusData);
          }
        } catch (e) {
          console.error('Error parsing refreshed status:', e);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Nie udało się wysłać prośby');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3 text-white/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Sprawdzam status trialu…</span>
        </div>
      </div>
    );
  }

  // If user already has elite plan (not from trial), don't show
  if (tier === 'elite' && (!status?.hasRequest || status?.status !== 'active')) {
    return null;
  }

  // If no request and status is null, show request button
  if (!status?.hasRequest && status?.status === null) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 ring-1 ring-inset ring-amber-400/30">
              <Crown className="h-5 w-5 text-amber-300" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">
                Przetestuj pakiet Elite za darmo przez 7 dni
              </h3>
              <p className="text-sm text-white/70 mb-3">
                Odblokuj pełny dostęp do Edulab, Decision Lab i wszystkich funkcji Elite. Bez zobowiązań.
              </p>
              {error && (
                <div className="mb-3 flex items-center gap-2 text-xs text-rose-400">
                  <XCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <button
                onClick={handleRequest}
                disabled={requesting}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-slate-900 font-semibold text-sm px-4 py-2 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {requesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wysyłanie…
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Poproś o 7-dniowy test Elite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status?.status === 'pending') {
    return (
      <div className="mb-6 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 ring-1 ring-inset ring-yellow-400/30">
            <Clock className="h-5 w-5 text-yellow-300" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Twoja prośba oczekuje na akceptację
            </h3>
            <p className="text-sm text-white/70">
              Administrator przejrzy Twoją prośbę o 7-dniowy test pakietu Elite. Otrzymasz powiadomienie po akceptacji.
            </p>
            {status.requestedAt && (
              <p className="text-xs text-white/50 mt-2">
                Data prośby: {new Date(status.requestedAt).toLocaleString('pl-PL')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status?.status === 'active' && status.daysRemaining !== null) {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-inset ring-emerald-400/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Twój trial Elite jest aktywny
            </h3>
            <p className="text-sm text-white/70 mb-2">
              Masz pełny dostęp do pakietu Elite. Pozostało dni: <span className="font-semibold text-emerald-300">{status.daysRemaining}</span>
            </p>
            {status.expiresAt && (
              <p className="text-xs text-white/50">
                Trial wygasa: {new Date(status.expiresAt).toLocaleString('pl-PL')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status?.status === 'expired') {
    return (
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
            <XCircle className="h-5 w-5 text-white/50" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Twój trial Elite wygasł
            </h3>
            <p className="text-sm text-white/70">
              Twój 7-dniowy test pakietu Elite dobiegł końca. Przejdź na pełny pakiet Elite, aby kontynuować korzystanie z wszystkich funkcji.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
