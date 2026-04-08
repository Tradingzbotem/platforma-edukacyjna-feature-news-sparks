'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const TABS = [
  { id: 'profil' as const, label: 'Profil' },
  { id: 'konto' as const, label: 'Konto' },
  { id: 'preferencje' as const, label: 'Preferencje' },
];

type TabId = (typeof TABS)[number]['id'];

type ProfilePayload = {
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  notify_edu: boolean;
  notify_market: boolean;
  plan: string;
};

type GateState = 'loading' | 'guest' | 'ready' | 'error';

function planLabel(plan: string | null): string {
  switch (plan) {
    case 'elite':
      return 'Elite';
    case 'pro':
      return 'Pro';
    case 'starter':
      return 'Starter';
    case 'free':
      return 'Darmowy';
    default:
      return plan ? String(plan) : '—';
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setLangCookie(code: string) {
  document.cookie = `lang=${encodeURIComponent(code)}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`;
}

function clearTranslateCache() {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('tr:')) localStorage.removeItem(k);
    }
  } catch {}
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function stringForInitials(display: string, first: string, last: string, emailFallback: string): string {
  const d = display.trim();
  if (d) return d;
  const fl = `${first.trim()} ${last.trim()}`.trim();
  if (fl) return fl;
  const at = emailFallback.split('@')[0]?.trim();
  return at || '?';
}

function safeAvatarSrc(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profil');
  const [gate, setGate] = useState<GateState>('loading');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyEdu, setNotifyEdu] = useState(true);
  const [notifyMarket, setNotifyMarket] = useState(true);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<string | null>(null);
  const [langUi, setLangUi] = useState<'pl' | 'en'>('pl');
  const [toast, setToast] = useState<{ msg: string; open: boolean }>({ msg: '', open: false });
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, open: true });
    setTimeout(() => setToast({ msg: '', open: false }), 2200);
  }, []);

  useEffect(() => {
    const c = getCookie('lang');
    if (c === 'en' || c === 'pl') setLangUi(c);
  }, []);

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/konto/profile', { cache: 'no-store' });
        if (cancelled) return;
        if (r.status === 401) {
          setGate('guest');
          return;
        }
        if (!r.ok) {
          setGate('error');
          return;
        }
        const j = (await r.json()) as { ok?: boolean; profile?: ProfilePayload };
        const p = j.profile;
        if (!p || !j.ok) {
          setGate('error');
          return;
        }
        setEmail(p.email);
        setPlan(p.plan);
        setFirstName(p.first_name ?? '');
        setLastName(p.last_name ?? '');
        setName(p.name ?? '');
        setAvatarUrl(p.avatar_url ?? '');
        setPhone(p.phone ?? '');
        setNotifyEdu(p.notify_edu);
        setNotifyMarket(p.notify_market);
        setGate('ready');
      } catch {
        if (!cancelled) setGate('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async () => {
    if (gate !== 'ready') return;
    setSaving(true);
    try {
      const r = await fetch('/api/konto/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          name,
          phone,
          avatar_url: avatarUrl,
          notify_edu: notifyEdu,
          notify_market: notifyMarket,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok) {
        if (j.error === 'invalid_avatar_url') {
          showToast('Nieprawidłowy adres URL zdjęcia (tylko http/https).');
        } else {
          showToast('Nie udało się zapisać. Spróbuj ponownie.');
        }
        return;
      }
      if (j.ok) showToast('Zapisano ustawienia.');
    } catch {
      showToast('Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  };

  const onLangChange = (code: 'pl' | 'en') => {
    setLangUi(code);
    setLangCookie(code);
    clearTranslateCache();
    window.location.reload();
  };

  const avatarSafe = safeAvatarSrc(avatarUrl);
  const displayInitials = initialsFromName(stringForInitials(name, firstName, lastName, email));

  if (gate === 'loading') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
          <p className="text-sm text-white/70">Ładowanie…</p>
        </header>
        <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (gate === 'guest') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
          <p className="text-sm text-white/70">Zaloguj się, aby edytować profil i preferencje konta.</p>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">
            <Link href="/logowanie?next=/konto/ustawienia" className="font-semibold text-blue-700 underline">
              Zaloguj się
            </Link>{' '}
            lub{' '}
            <Link href="/rejestracja" className="font-semibold text-blue-700 underline">
              załóż konto
            </Link>
            , aby zapisywać dane na serwerze.
          </p>
        </div>
      </div>
    );
  }

  if (gate === 'error') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
          <p className="text-sm text-white/70">Nie udało się wczytać profilu.</p>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Sprawdź połączenie lub spróbuj ponownie później.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Ustawienia</h1>
        <p className="text-sm text-white/70">Profil, konto i preferencje — zapis na Twoim koncie.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          role="tablist"
          aria-label="Zakładki ustawień"
          className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2 sm:gap-0 sm:rounded-t-2xl"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                id={`tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`min-h-[44px] flex-1 rounded-xl px-3 py-2 text-sm font-medium transition sm:min-h-0 sm:flex-none sm:rounded-lg sm:px-4 ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {tab === 'profil' ? (
            <div
              role="tabpanel"
              id="panel-profil"
              aria-labelledby="tab-profil"
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Profil publiczny</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Imię i nazwisko, opcjonalna nazwa wyświetlana oraz zdjęcie profilu (link do obrazka).
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-lg font-bold text-slate-600">
                  {avatarSafe && !avatarBroken ? (
                    <img
                      src={avatarSafe}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarBroken(true)}
                    />
                  ) : (
                    <span aria-hidden>{displayInitials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-700">Imię</span>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jan"
                        autoComplete="given-name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-700">Nazwisko</span>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Kowalski"
                        autoComplete="family-name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">Wyświetlana nazwa (opcjonalnie)</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Np. pseudonim — jeśli pusto, użyjemy imienia i nazwiska"
                      autoComplete="nickname"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      URL zdjęcia profilowego (opcjonalnie)
                    </span>
                    <input
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://…"
                      inputMode="url"
                      autoComplete="photo"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'konto' ? (
            <div
              role="tabpanel"
              id="panel-konto"
              aria-labelledby="tab-konto"
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Konto i bezpieczeństwo</h2>
                <p className="mt-1 text-sm text-slate-600">
                  E-mail służy do logowania. Numer telefonu możesz uzupełnić lub zmienić tutaj.
                </p>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                  <dt className="text-slate-500">E-mail</dt>
                  <dd className="font-medium text-slate-900">{email || '—'}</dd>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                  <dt className="text-slate-500">Plan</dt>
                  <dd className="font-medium text-slate-900">{planLabel(plan)}</dd>
                </div>
              </dl>

              <label className="block max-w-md">
                <span className="mb-1 block text-sm font-medium text-slate-700">Numer telefonu</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 …"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
                <strong className="font-semibold">Hasło:</strong> zmiana hasła nie jest jeszcze dostępna w panelu. W razie
                problemów z dostępem{' '}
                <Link href="/kontakt" className="font-medium underline">
                  napisz do nas
                </Link>
                .
              </div>

              <Link
                href="/konto/plan"
                className="inline-flex text-sm font-medium text-blue-700 underline hover:text-blue-800"
              >
                Szczegóły planu i rozliczeń →
              </Link>
            </div>
          ) : null}

          {tab === 'preferencje' ? (
            <div
              role="tabpanel"
              id="panel-preferencje"
              aria-labelledby="tab-preferencje"
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Preferencje</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Język interfejsu i powiadomienia w aplikacji. Zgody marketingowe ustawiasz przy rejestracji.
                </p>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">Język</legend>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['pl', 'Polski'],
                      ['en', 'English'],
                    ] as const
                  ).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onLangChange(code)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        langUi === code
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-slate-700">Powiadomienia</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={notifyEdu}
                    onChange={(e) => setNotifyEdu(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Edukacja</span> — lekcje, quizy i materiały (gdy włączymy
                    kanały powiadomień).
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={notifyMarket}
                    onChange={(e) => setNotifyMarket(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Rynek</span> — alerty i skróty z panelu.
                  </span>
                </label>
              </fieldset>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Zapisujemy imię, nazwisko, nazwę wyświetlaną, awatar, telefon i powiadomienia na koncie.
          </p>
          <button
            type="button"
            onClick={() => void saveProfile()}
            disabled={saving}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>

      {toast.open ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
          <div className="pointer-events-auto rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg ring-1 ring-black/10">
            {toast.msg}
          </div>
        </div>
      ) : null}
    </div>
  );
}
