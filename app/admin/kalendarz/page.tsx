'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { RefreshCw, CheckCircle2, XCircle, Calendar, Info, Upload, Trash2 } from 'lucide-react';

type RefreshStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  eventsCount?: number;
  timestamp?: string;
};

type ImportStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  inserted?: number;
  skipped?: number;
  total?: number;
};

export default function AdminCalendarPage() {
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>({ status: 'idle' });
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ status: 'idle' });
  const [lastImport, setLastImport] = useState<string | null>(null);
  const [pastedData, setPastedData] = useState('');
  const [clearExisting, setClearExisting] = useState(false);
  const [importMethod, setImportMethod] = useState<'paste' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Load last import timestamp on mount
  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const res = await fetch('/api/admin/calendar/last-import');
        const data = await res.json();
        if (data.lastImport) {
          setLastImport(new Date(data.lastImport).toLocaleString('pl-PL'));
        }
      } catch (error) {
        // Silently fail - not critical
      }
    };
    fetchLastImport();
  }, []);

  const handleImport = async () => {
    if (importMethod === 'file') {
      if (!selectedFile) {
        setImportStatus({
          status: 'error',
          message: 'Wybierz plik Excel przed importem',
        });
        return;
      }

      setImportStatus({ status: 'loading', message: 'Importowanie danych z pliku...' });
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('clearExisting', clearExisting ? 'true' : 'false');

        const res = await fetch('/api/admin/calendar/import', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setImportStatus({
            status: 'success',
            message: data.message || 'Dane zostały zaimportowane pomyślnie',
            inserted: data.inserted,
            skipped: data.skipped,
            total: data.total,
          });
          setLastImport(new Date().toLocaleString('pl-PL'));
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.getElementById('file-input') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          setImportStatus({
            status: 'error',
            message: data.error || 'Błąd podczas importu danych',
          });
        }
      } catch (error: any) {
        setImportStatus({
          status: 'error',
          message: error?.message || 'Nie udało się połączyć z serwerem',
        });
      }
    } else {
      if (!pastedData.trim()) {
        setImportStatus({
          status: 'error',
          message: 'Wklej dane z tabeli Excel przed importem',
        });
        return;
      }

      setImportStatus({ status: 'loading', message: 'Importowanie danych...' });
      try {
        const res = await fetch('/api/admin/calendar/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: pastedData,
            clearExisting,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setImportStatus({
            status: 'success',
            message: data.message || 'Dane zostały zaimportowane pomyślnie',
            inserted: data.inserted,
            skipped: data.skipped,
            total: data.total,
          });
          setLastImport(new Date().toLocaleString('pl-PL'));
          setPastedData(''); // Clear after successful import
        } else {
          setImportStatus({
            status: 'error',
            message: data.error || 'Błąd podczas importu danych',
          });
        }
      } catch (error: any) {
        setImportStatus({
          status: 'error',
          message: error?.message || 'Nie udało się połączyć z serwerem',
        });
      }
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

        {/* Import Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Import z Excel</h2>
              {lastImport && (
                <p className="text-xs text-white/60 mt-1">
                  Ostatnia aktualizacja przez import: <span className="text-white/80 font-medium">{lastImport}</span>
                </p>
              )}
            </div>
            <a
              href="/api/admin/calendar/template"
              download
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Pobierz szablon Excel
            </a>
          </div>
          <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-4 mb-4">
            <p className="text-sm font-semibold text-blue-200 mb-2">Format danych:</p>
            <p className="text-xs text-blue-200/90 mb-2">
              Każdy wiersz powinien zawierać: <strong>Data</strong>, <strong>Czas</strong>, <strong>Wal.</strong>, <strong>Wydarzenie</strong>, <strong>Waga</strong>, <strong>Obecny</strong>, <strong>Prognoza</strong>, <strong>Poprzedni</strong>
            </p>
            <ul className="text-xs text-blue-200/90 list-disc list-inside space-y-1">
              <li><strong>Data:</strong> Format YYYY-MM-DD (np. 2026-01-19) - <span className="text-blue-300">WAŻNE: każdy wiersz musi mieć swoją datę!</span></li>
              <li><strong>Czas:</strong> Format HH:mm (np. 13:30, 00:50, 17:54)</li>
              <li><strong>Wal.:</strong> Kod waluty (USD, EUR, GBP, JPY, CNY, itd.)</li>
              <li><strong>Wydarzenie:</strong> Nazwa wydarzenia (np. "CPI (m/m) (Dec)")</li>
              <li><strong>Waga:</strong> ważność - "wysoka", "średnia", "niska" lub puste</li>
              <li><strong>Obecny/Prognoza/Poprzedni:</strong> Wartości liczbowe (opcjonalne)</li>
            </ul>
          </div>
          <p className="text-sm text-white/70 mb-4">
            Zaimportuj plik Excel (XLSX, XLS, ODS) lub CSV. Pobierz szablon powyżej, wypełnij go danymi i zaimportuj.
          </p>

          {/* Method selector */}
          <div className="mb-4 flex gap-3">
            <button
              type="button"
              onClick={() => setImportMethod('file')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                importMethod === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Plik Excel
            </button>
            <button
              type="button"
              onClick={() => setImportMethod('paste')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                importMethod === 'paste'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Wklej tabelę
            </button>
          </div>

          {importMethod === 'file' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Wybierz plik Excel:</label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.ods,.csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/80 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-white/70">
                  Wybrany plik: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Wklej dane z tabeli:</label>
              <textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder="Wklej tutaj tabelę z Excel (Ctrl+V)..."
                className="w-full h-48 px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="clearExisting"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="clearExisting" className="text-sm text-white/70 cursor-pointer">
              Wyczyść istniejące wydarzenia przed importem
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={
                importStatus.status === 'loading' ||
                (importMethod === 'file' ? !selectedFile : !pastedData.trim())
              }
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload
                className={`h-5 w-5 ${importStatus.status === 'loading' ? 'animate-pulse' : ''}`}
              />
              {importStatus.status === 'loading' ? 'Importowanie...' : 'Importuj dane'}
            </button>
            {importStatus.status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-300 text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  {importStatus.inserted} wydarzeń zaimportowanych
                  {importStatus.skipped && importStatus.skipped > 0 && ` (${importStatus.skipped} pominiętych)`}
                </span>
              </div>
            )}
            {importStatus.status === 'error' && (
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <XCircle className="h-5 w-5" />
                <span>{importStatus.message}</span>
              </div>
            )}
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
            {refreshStatus.status === 'loading' ? 'Odświeżanie...' : 'Odśwież kalendarz (Finnhub)'}
          </button>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200 space-y-2">
              <p className="font-semibold">Jak działa system kalendarza?</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-200/90">
                <li><strong>Import z Excel:</strong> Załaduj plik Excel (XLSX, XLS, ODS) lub CSV, lub wklej tabelę. System automatycznie rozpozna kolumny i zapisze wydarzenia do bazy danych.</li>
                <li><strong>Odświeżanie z Finnhub:</strong> Pobiera dane z Finnhub Economic Calendar API i przetwarza przez AI (GPT).</li>
                <li><strong>Priorytety:</strong> Kalendarz najpierw sprawdza dane z bazy (importowane), potem Finnhub, na końcu fallback EDU.</li>
                <li><strong>Automatyczna aktualizacja:</strong> Po imporcie kalendarz w panelu EDU automatycznie pokazuje nowe wydarzenia.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
