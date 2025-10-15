import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8 text-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Polityka prywatności</h1>
      <p className="mt-2 text-white/70">Wersja edukacyjna, uproszczona (przykładowa treść).</p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/80">
        <section>
          <h2 className="font-semibold">1. Dane zbierane</h2>
          <p>Podstawowe dane konta (email, nickname) oraz dane techniczne (logi, cookies).</p>
        </section>
        <section>
          <h2 className="font-semibold">2. Cel przetwarzania</h2>
          <p>Usprawnienie nauki, personalizacja treści, bezpieczeństwo i statystyki.</p>
        </section>
        <section>
          <h2 className="font-semibold">3. Podstawy prawne</h2>
          <p>Zgoda użytkownika oraz uzasadniony interes administratora.</p>
        </section>
        <section>
          <h2 className="font-semibold">4. Prawa użytkownika</h2>
          <p>Dostęp, sprostowanie, usunięcie, ograniczenie, sprzeciw, przenoszenie danych.</p>
        </section>
        <section>
          <h2 className="font-semibold">5. Udostępnianie danych</h2>
          <p>Wyłącznie podmiotom przetwarzającym w naszym imieniu (hosting, analityka) na podstawie umów.</p>
        </section>
      </div>
    </main>
  );
}
