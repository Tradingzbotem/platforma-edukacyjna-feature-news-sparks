import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8 text-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Warunki korzystania</h1>
      <p className="mt-2 text-white/70">Wersja edukacyjna, uproszczona (przykładowa treść).</p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/80">
        <section>
          <h2 className="font-semibold">1. Cel serwisu</h2>
          <p>Serwis ma charakter edukacyjny i nie stanowi doradztwa inwestycyjnego ani rekomendacji.</p>
        </section>
        <section>
          <h2 className="font-semibold">2. Odpowiedzialność</h2>
          <p>Użytkownik ponosi pełną odpowiedzialność za decyzje inwestycyjne. Operator nie odpowiada za straty.</p>
        </section>
        <section>
          <h2 className="font-semibold">3. Prawa autorskie</h2>
          <p>Materiały są chronione prawem autorskim. Kopiowanie bez zgody zabronione.</p>
        </section>
        <section>
          <h2 className="font-semibold">4. Zachowanie użytkowników</h2>
          <p>Zakaz spamu, treści obraźliwych, reklam bez zgody operatora.</p>
        </section>
        <section>
          <h2 className="font-semibold">5. Founders NFT</h2>
          <p>
            Dostęp może być nabywany przez Founders NFT (licencja na korzystanie z Serwisu, płatność w krypto). NFT nie
            jest instrumentem finansowym. Szczegóły:{" "}
            <Link href="/prawne/nft" className="underline">
              Regulamin sprzedaży NFT
            </Link>
            ,{" "}
            <Link href="/cennik" className="underline">
              cennik
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="font-semibold">6. Zmiany warunków</h2>
          <p>Operator może modyfikować treść w każdym czasie. Aktualna wersja obowiązuje od publikacji.</p>
        </section>
      </div>
    </main>
  );
}
