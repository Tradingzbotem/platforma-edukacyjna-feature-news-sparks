'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { Plus, Trash2, Save, Newspaper, FilePlus, RefreshCw } from 'lucide-react';
import type { DecisionBriefJsonDto } from '@/lib/decision-brief/types';
import type { DecisionBriefPrefillDraft } from '@/lib/decision-brief/prefillFromNews';

type AssetForm = {
  asset: string;
  baseDirection: string;
  supports: string;
  weakens: string;
  sensitivity: string;
  sortOrder: number;
};

const emptyAsset = (order: number): AssetForm => ({
  asset: '',
  baseDirection: '',
  supports: '',
  weakens: '',
  sensitivity: 'średnia',
  sortOrder: order,
});

type LoadMode = 'initial' | 'manual' | 'silent';

/** Skąd admin bierze aktualną treść w formularzu (UX, bez zmiany modelu DB). */
type WorkbenchMode = 'server' | 'empty' | 'news_cluster';

function workModeLabel(mode: WorkbenchMode): string {
  switch (mode) {
    case 'empty':
      return 'Tryb: pusty szkic';
    case 'news_cluster':
      return 'Tryb: draft z wybranego klastra (newsy)';
    case 'server':
    default:
      return 'Tryb: ostatni zapis (serwer)';
  }
}

/** Ostatni news w klastrze — do UI (pusta gdy brak sensownej daty). */
function formatClusterLatest(iso?: string | null): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t) || t <= 0) return '—';
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(t);
}

type ClientTopicChoice = {
  clusterId: string;
  clusterKey: string;
  clusterLabel: string;
  rank: number;
  newsCount?: number;
  latestNewsAt?: string;
  earliestNewsAt?: string;
  draft: DecisionBriefPrefillDraft;
};

type SaveBanner = { at: string; kind: 'draft' | 'published' };

export default function AdminBriefDecyzyjnyPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<SaveBanner | null>(null);

  const [workMode, setWorkMode] = useState<WorkbenchMode>('server');
  const [generatorHint, setGeneratorHint] = useState<string | null>(null);
  const [topicChoices, setTopicChoices] = useState<ClientTopicChoice[]>([]);
  const [topicQuickChoices, setTopicQuickChoices] = useState<ClientTopicChoice[]>([]);
  const [topicsMeta, setTopicsMeta] = useState<{
    newsCount: number;
    totalClustersRaw: number;
    skippedDuplicateOrSimilar: number;
    topicsReturned?: number;
  } | null>(null);
  const [topicsLoadError, setTopicsLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [narrativeAxis, setNarrativeAxis] = useState('');
  const [context, setContext] = useState('');
  const [onRadar, setOnRadar] = useState('');
  const [priorityOfDay, setPriorityOfDay] = useState('');
  const [baseScenario, setBaseScenario] = useState('');
  const [alternativeScenario, setAlternativeScenario] = useState('');
  const [invalidation, setInvalidation] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [assets, setAssets] = useState<AssetForm[]>([emptyAsset(0)]);

  /** Jedna hydratacja z API przy wejściu — bez ponownego nadpisywania po „Nowy pusty brief”. */
  const didInitialHydrateRef = useRef(false);
  const didApplyEmptyHashRef = useRef(false);

  const resetFormToEmpty = useCallback(() => {
    setTitle('');
    setSummary('');
    setNarrativeAxis('');
    setContext('');
    setOnRadar('');
    setPriorityOfDay('');
    setBaseScenario('');
    setAlternativeScenario('');
    setInvalidation('');
    setIsPublished(false);
    setAssets([emptyAsset(0)]);
  }, []);

  const applyDto = useCallback((b: DecisionBriefJsonDto) => {
    setTitle(b.title ?? '');
    setSummary(b.summary ?? '');
    setNarrativeAxis(b.narrativeAxis ?? '');
    setContext(b.context ?? '');
    setOnRadar(b.onRadar ?? '');
    setPriorityOfDay(b.priorityOfDay ?? '');
    setBaseScenario(b.baseScenario ?? '');
    setAlternativeScenario(b.alternativeScenario ?? '');
    setInvalidation(b.invalidation ?? '');
    setIsPublished(Boolean(b.isPublished));
    const list = Array.isArray(b.assets) ? b.assets : [];
    setAssets(
      list.length
        ? list.map((a) => ({
            asset: a.asset ?? '',
            baseDirection: a.baseDirection ?? '',
            supports: a.supports ?? '',
            weakens: a.weakens ?? '',
            sensitivity: a.sensitivity || 'średnia',
            sortOrder: a.sortOrder,
          }))
        : [emptyAsset(0)],
    );
  }, []);

  const fetchBriefDto = useCallback(async (): Promise<DecisionBriefJsonDto | null> => {
    const r = await fetch('/api/admin/decision-brief', { cache: 'no-store' });
    const data = await r.json();
    if (!r.ok || !data.ok) {
      throw new Error(data.error || `HTTP ${r.status}`);
    }
    return data.brief ? (data.brief as DecisionBriefJsonDto) : null;
  }, []);

  const load = useCallback(
    async (mode: LoadMode) => {
      if (mode === 'silent') {
        try {
          const brief = await fetchBriefDto();
          if (brief) applyDto(brief);
          else resetFormToEmpty();
          setWorkMode(brief ? 'server' : 'empty');
          setGeneratorHint(null);
        } catch {
          /* odpowiedź PUT mogła już zsynchronizować stan */
        }
        return;
      }

      setError(null);
      if (mode === 'initial') setInitialLoading(true);
      if (mode === 'manual') setRefreshing(true);
      try {
        const brief = await fetchBriefDto();
        if (brief) {
          applyDto(brief);
          setWorkMode('server');
        } else {
          resetFormToEmpty();
          setWorkMode('empty');
        }
        setGeneratorHint(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Nie udało się wczytać briefu');
      } finally {
        if (mode === 'initial') setInitialLoading(false);
        if (mode === 'manual') setRefreshing(false);
      }
    },
    [applyDto, fetchBriefDto, resetFormToEmpty],
  );

  useEffect(() => {
    if (didInitialHydrateRef.current) return;
    didInitialHydrateRef.current = true;
    void load('initial');
  }, [load]);

  const applyDraftToForm = useCallback((d: DecisionBriefPrefillDraft) => {
    setTitle(d.title);
    setSummary(d.summary);
    setNarrativeAxis(d.narrativeAxis);
    setContext(d.context);
    setOnRadar(d.onRadar);
    setPriorityOfDay(d.priorityOfDay);
    setBaseScenario(d.baseScenario);
    setAlternativeScenario(d.alternativeScenario);
    setInvalidation(d.invalidation);
    setIsPublished(false);
    setAssets(
      d.assets?.length
        ? d.assets.map((a, i) => ({
            asset: a.asset,
            baseDirection: a.baseDirection,
            supports: a.supports,
            weakens: a.weakens,
            sensitivity: a.sensitivity || 'średnia',
            sortOrder: a.sortOrder ?? i,
          }))
        : [emptyAsset(0)],
    );
  }, []);

  const fetchTopicClusters = useCallback(async () => {
    setPrefilling(true);
    setTopicsLoadError(null);
    try {
      const r = await fetch('/api/admin/decision-brief/prefill-from-news?hours=48', { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      const rawAll = Array.isArray(data.topicsAll) ? data.topicsAll : data.topics;
      const list = Array.isArray(rawAll) ? (rawAll as ClientTopicChoice[]) : [];
      setTopicChoices(list);
      const rawQuick = Array.isArray(data.topicsQuick) ? data.topicsQuick : data.topics;
      const quickList = Array.isArray(rawQuick) ? (rawQuick as ClientTopicChoice[]) : [];
      setTopicQuickChoices(quickList);
      if (data.meta && typeof data.meta === 'object') {
        setTopicsMeta({
          newsCount: Number(data.meta.newsCount) || 0,
          totalClustersRaw: Number(data.meta.totalClustersRaw) || 0,
          skippedDuplicateOrSimilar: Number(data.meta.skippedDuplicateOrSimilar) || 0,
          topicsReturned:
            typeof data.meta.topicsReturned === 'number' ? data.meta.topicsReturned : undefined,
        });
      } else {
        setTopicsMeta(null);
      }
    } catch (e: unknown) {
      setTopicChoices([]);
      setTopicQuickChoices([]);
      setTopicsMeta(null);
      setTopicsLoadError(e instanceof Error ? e.message : 'Nie udało się pobrać klastrów tematów');
    } finally {
      setPrefilling(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    void fetchTopicClusters();
  }, [initialLoading, fetchTopicClusters]);

  function applyTopicChoice(t: ClientTopicChoice) {
    applyDraftToForm(t.draft);
    setWorkMode('news_cluster');
    const n = typeof t.newsCount === 'number' ? t.newsCount : '—';
    const when = formatClusterLatest(t.latestNewsAt);
    setGeneratorHint(
      `Draft z klastra #${t.rank} · ${t.clusterLabel} · ${n} newsów · ostatni: ${when} · id: ${t.clusterId} (niezapisany — „Zapisz szkic” lub „Zapisz i opublikuj”).`,
    );
    setSaveBanner(null);
    setError(null);
  }

  function startNewEmptyBrief() {
    resetFormToEmpty();
    setWorkMode('empty');
    setGeneratorHint(null);
    setError(null);
    setSaveBanner(null);
  }

  useEffect(() => {
    if (initialLoading || didApplyEmptyHashRef.current) return;
    if (typeof window === 'undefined') return;
    const h = window.location.hash.replace(/^#/, '');
    if (h !== 'empty' && h !== 'nowy') return;
    didApplyEmptyHashRef.current = true;
    resetFormToEmpty();
    setWorkMode('empty');
    setGeneratorHint(null);
    setError(null);
    setSaveBanner(null);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [initialLoading, resetFormToEmpty]);

  async function saveBrief(wantPublish: boolean) {
    setSaving(true);
    setError(null);
    setSaveBanner(null);
    try {
      const payload = {
        title: title.trim() || 'Bez tytułu',
        summary,
        narrativeAxis,
        context,
        onRadar,
        priorityOfDay,
        baseScenario,
        alternativeScenario,
        invalidation,
        isPublished: wantPublish,
        assets: assets
          .filter((a) => a.asset.trim())
          .map((a, i) => ({
            asset: a.asset.trim(),
            baseDirection: a.baseDirection,
            supports: a.supports,
            weakens: a.weakens,
            sensitivity: a.sensitivity,
            sortOrder: i,
          })),
      };
      const r = await fetch('/api/admin/decision-brief', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${r.status}`);
      }
      if (data.brief) {
        applyDto(data.brief as DecisionBriefJsonDto);
      }
      setSaveBanner({
        at: new Date().toISOString(),
        kind: payload.isPublished ? 'published' : 'draft',
      });
      setWorkMode('server');
      setGeneratorHint(null);
      await load('silent');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Zapis nie powiódł się');
    } finally {
      setSaving(false);
    }
  }

  function addAsset() {
    setAssets((prev) => [...prev, emptyAsset(prev.length)]);
  }

  function removeAsset(index: number) {
    setAssets((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function updateAsset(index: number, patch: Partial<AssetForm>) {
    setAssets((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  const toolbarDisabled = prefilling || initialLoading || refreshing || saving;
  const emptyBriefDisabled = toolbarDisabled;

  const saveBannerText = useMemo(() => {
    if (!saveBanner) return null;
    if (saveBanner.kind === 'published') return 'Brief zapisany i opublikowany';
    return 'Szkic briefu zapisany';
  }, [saveBanner]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-3">
          <BackButton />
          <Link
            href="/rynek/brief-decyzyjny-mockup"
            className="text-sm text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline"
          >
            Podgląd publiczny
          </Link>
        </nav>

        <h1 className="text-2xl font-bold mb-1">Brief decyzyjny</h1>
        <p className="text-sm text-white/60 mb-6">
          MVP: jeden rekord o stałym slug <code className="text-violet-300">daily</code>. Lista — jedna linia na punkt
          (oś narracji, kontekst, radar, scenariusze).
        </p>

        {initialLoading ? (
          <p className="text-white/60">Ładowanie…</p>
        ) : (
          <div className="space-y-6">
            {refreshing ? (
              <p className="text-xs text-white/45" role="status">
                Pobieranie z serwera…
              </p>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
            {saveBanner && saveBannerText ? (
              <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-100">
                <span className="font-medium">{saveBannerText}</span>
                <span className="block text-xs text-emerald-200/75 mt-1">
                  {new Intl.DateTimeFormat('pl-PL', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  }).format(new Date(saveBanner.at))}
                </span>
              </div>
            ) : null}

            <div className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-4 space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <p className="text-xs font-medium uppercase tracking-wide text-white/45">Akcje robocze</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={startNewEmptyBrief}
                  disabled={emptyBriefDisabled}
                  className="inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-lg border border-slate-400/35 bg-slate-800/80 px-4 py-2 text-sm font-medium text-white hover:border-slate-300/50 hover:bg-slate-700/80 disabled:opacity-50"
                >
                  <FilePlus className="h-4 w-4 shrink-0" />
                  Nowy pusty brief
                </button>
                <button
                  type="button"
                  onClick={() => void fetchTopicClusters()}
                  disabled={toolbarDisabled}
                  className="inline-flex flex-1 min-w-[10rem] items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 shrink-0 ${prefilling ? 'animate-spin' : ''}`} />
                  {prefilling ? 'Ładowanie klastrów…' : 'Odśwież listę tematów'}
                </button>
              </div>
              <p className="text-xs text-white/50">
                Newsy jak na{' '}
                <Link href="/news" className="text-violet-300 underline-offset-2 hover:underline">
                  /news
                </Link>{' '}
                (48h). Tematy to klastry: kategoria + tickery (lub tytuł). Wybierz klastra — formularz wypełni się
                tylko newsami z tego tematu. Zapis do bazy: „Zapisz szkic” lub „Zapisz i opublikuj”.
              </p>
            </div>

            <div className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-4 py-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-violet-200/90 flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  Tematy / klastry
                </p>
                {topicsMeta ? (
                  <p className="text-[11px] text-white/45">
                    Newsów: {topicsMeta.newsCount}
                    {topicsMeta.topicsReturned != null ? ` · klastrów na liście: ${topicsMeta.topicsReturned}` : ''} ·
                    surowych: {topicsMeta.totalClustersRaw}
                    {topicsMeta.skippedDuplicateOrSimilar > 0
                      ? ` · odrzucono podobne: ${topicsMeta.skippedDuplicateOrSimilar}`
                      : ''}
                  </p>
                ) : null}
              </div>
              {topicsLoadError ? (
                <p className="text-sm text-rose-300">{topicsLoadError}</p>
              ) : null}
              {!prefilling && !topicsLoadError && topicChoices.length === 0 ? (
                <p className="text-sm text-white/55">
                  Brak odrębnych klastrów do pokazania (albo wszystkie odrzucone jako zbyt podobne). Odśwież listę lub
                  sprawdź newsy w oknie 48h.
                </p>
              ) : null}
              {topicChoices.length > 0 ? (
                <>
                  <div className="flex flex-col gap-2 sm:hidden">
                    <p className="text-[11px] text-white/45">
                      Szybki wybór (5 zróżnicowanych kategorii — nie tylko top score)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topicQuickChoices.map((t) => (
                        <button
                          key={t.clusterId}
                          type="button"
                          onClick={() => applyTopicChoice(t)}
                          disabled={prefilling || saving}
                          className="inline-flex max-w-full flex-col items-start gap-0.5 rounded-lg border border-violet-400/35 bg-violet-600/20 px-2.5 py-1.5 text-left text-xs text-white hover:bg-violet-600/35 disabled:opacity-50"
                        >
                          <span className="font-semibold text-violet-200/90">Pełna lista #{t.rank}</span>
                          <span className="line-clamp-2">{t.clusterLabel}</span>
                          <span className="text-[10px] text-white/45">
                            {t.newsCount != null ? `${t.newsCount} news.` : '—'} · ost. {formatClusterLatest(t.latestNewsAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                    <label className="text-xs text-white/50">Wszystkie klastry (lista)</label>
                    <select
                      className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                      defaultValue=""
                      onChange={(e) => {
                        const id = e.target.value;
                        const t = topicChoices.find((x) => x.clusterId === id);
                        if (t) applyTopicChoice(t);
                        e.target.value = '';
                      }}
                    >
                      <option value="">— Wybierz klastra —</option>
                      {topicChoices.map((t) => (
                        <option key={t.clusterId} value={t.clusterId}>
                          #{t.rank} · {t.clusterLabel}
                          {t.newsCount != null ? ` · ${t.newsCount} news.` : ''} · ost. {formatClusterLatest(t.latestNewsAt)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden sm:flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] text-white/45">
                        Szybki wybór — do 5 tematów z różnych kategorii (FX, surowce, makro, spółki, geo…), bez dublowania
                        zbyt podobnych klastrów
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topicQuickChoices.map((t) => (
                          <button
                            key={t.clusterId}
                            type="button"
                            onClick={() => applyTopicChoice(t)}
                            disabled={prefilling || saving}
                            className="inline-flex max-w-full flex-col items-start gap-0.5 rounded-lg border border-violet-400/35 bg-violet-600/25 px-3 py-2 text-left text-sm text-white hover:bg-violet-600/40 disabled:opacity-50"
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-200/90">
                              #{t.rank} w rankingu
                            </span>
                            <span className="line-clamp-2 text-white/90">{t.clusterLabel}</span>
                            <span className="text-[10px] text-white/50">
                              {t.newsCount != null ? `${t.newsCount} newsów` : '—'} · ostatni:{' '}
                              {formatClusterLatest(t.latestNewsAt)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-violet-500/20 pt-3">
                      <p className="text-[11px] text-white/45">
                        Wszystkie klastry ({topicChoices.length}) — kliknięcie wczytuje draft do formularza
                      </p>
                      <ul
                        className="max-h-[min(22rem,50vh)] overflow-y-auto rounded-lg border border-white/10 bg-slate-950/60 divide-y divide-white/[0.06]"
                        role="list"
                      >
                        {topicChoices.map((t) => (
                          <li key={t.clusterId}>
                            <button
                              type="button"
                              onClick={() => applyTopicChoice(t)}
                              disabled={prefilling || saving}
                              className="flex w-full flex-col items-stretch gap-0.5 px-3 py-2.5 text-left text-sm text-white/90 transition hover:bg-violet-600/15 disabled:opacity-50 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="text-[11px] font-medium text-violet-200/85">#{t.rank}</span>{' '}
                                <span className="text-white/90">{t.clusterLabel}</span>
                              </span>
                              <span className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] text-white/45 sm:items-end">
                                <span className="whitespace-nowrap">
                                  {t.newsCount != null ? `${t.newsCount} news.` : '—'} · ost.{' '}
                                  {formatClusterLatest(t.latestNewsAt)}
                                </span>
                                <span className="font-mono text-[10px] text-white/35 truncate max-w-[9rem] sm:max-w-[11rem]">
                                  {t.clusterId}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="rounded-xl border border-cyan-500/35 bg-cyan-950/20 px-4 py-2.5 text-sm text-cyan-100/95 shadow-[0_0_24px_-12px_rgba(34,211,238,0.35)]">
              <span className="font-semibold tracking-tight">{workModeLabel(workMode)}</span>
              <span className="text-cyan-200/70"> · </span>
              <span className="text-cyan-100/80">
                „Nowy pusty brief” czyści tylko formularz w przeglądarce i nie woła ponownie API — stary szkic z serwera
                wczytasz przyciskiem „Odśwież z serwera”.
              </span>
            </div>

            {generatorHint ? (
              <div className="rounded-xl border border-amber-400/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-50 shadow-[0_0_20px_-10px_rgba(251,191,36,0.35)]">
                {generatorHint}
              </div>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Tytuł</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Streszczenie (opcjonalnie, akapit)</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Oś narracji (linie)</span>
              <textarea
                value={narrativeAxis}
                onChange={(e) => setNarrativeAxis(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[13px]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Kontekst (linie)</span>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[13px]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Na radarze (linie)</span>
              <textarea
                value={onRadar}
                onChange={(e) => setOnRadar(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[13px]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Priorytet dnia</span>
              <textarea
                value={priorityOfDay}
                onChange={(e) => setPriorityOfDay(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Scenariusz bazowy (linie)</span>
              <textarea
                value={baseScenario}
                onChange={(e) => setBaseScenario(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[13px]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Scenariusz alternatywny (linie)</span>
              <textarea
                value={alternativeScenario}
                onChange={(e) => setAlternativeScenario(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[13px]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-white/80">Unieważnienie (linie)</span>
              <textarea
                value={invalidation}
                onChange={(e) => setInvalidation(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/40 font-mono text-[13px]"
              />
            </label>

            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-lg font-semibold">Aktywa pod wpływem</h2>
                <button
                  type="button"
                  onClick={addAsset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/15"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj
                </button>
              </div>
              <div className="space-y-4">
                {assets.map((a, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                  >
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200"
                        aria-label="Usuń wiersz"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Usuń
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-medium text-white/60">Aktywo (np. WTI)</span>
                        <input
                          value={a.asset}
                          onChange={(e) => updateAsset(index, { asset: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-medium text-white/60">Kierunek bazowy</span>
                        <input
                          value={a.baseDirection}
                          onChange={(e) => updateAsset(index, { baseDirection: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-white/60">Wspiera</span>
                        <input
                          value={a.supports}
                          onChange={(e) => updateAsset(index, { supports: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs font-medium text-white/60">Osłabia</span>
                        <input
                          value={a.weakens}
                          onChange={(e) => updateAsset(index, { weakens: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block space-y-1 sm:col-span-2">
                        <span className="text-xs font-medium text-white/60">Wrażliwość</span>
                        <select
                          value={a.sensitivity}
                          onChange={(e) => updateAsset(index, { sensitivity: e.target.value })}
                          className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm"
                        >
                          <option value="wysoka">wysoka</option>
                          <option value="średnia">średnia</option>
                          <option value="niska">niska</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={() => void saveBrief(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:border-violet-400/50 hover:bg-white/[0.06] disabled:opacity-50"
                >
                  <Save className="h-4 w-4 opacity-80" />
                  {saving ? 'Zapisywanie…' : 'Zapisz szkic'}
                </button>
                <button
                  type="button"
                  onClick={() => void saveBrief(true)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-8px_rgba(139,92,246,0.55)] hover:bg-violet-500 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Zapisywanie…' : 'Zapisz i opublikuj'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void load('manual')}
                disabled={refreshing}
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-white/10 disabled:opacity-50 sm:ml-auto"
              >
                Odśwież z serwera
              </button>
            </div>
            <p className="text-xs text-white/45 -mt-1">
              „Zapisz i opublikuj” ustawia brief jako widoczny publicznie (inne opublikowane wersje zostaną wyłączone).
              Stan szkicu vs publikacji widać po powrocie na{' '}
              <Link href="/admin" className="text-violet-300 underline-offset-2 hover:underline">
                panel admina
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
