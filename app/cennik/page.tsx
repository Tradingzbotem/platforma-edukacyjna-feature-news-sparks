import Link from "next/link";
import {
  FoundersLockedBenefitsBlock,
  FoundersPricingLadderBlock,
} from "@/components/marketplace/FoundersMarketPanels";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8 text-white">
      <nav className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          ← Strona główna
        </Link>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold">Cennik</h1>
      <p className="mt-2 text-white/70">
        FXEDULAB — jednorazowy zakup Founders NFT; brak abonamentu miesięcznego za dostęp dla posiadacza NFT.
      </p>

      <div className="mt-8 space-y-10">
        <section className="space-y-6">
          <FoundersPricingLadderBlock variant="compact" />
          <FoundersLockedBenefitsBlock variant="compact" />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Founders NFT — pełny dostęp</h2>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#0b1220] border border-emerald-500/25 p-6 md:p-8">
            <p className="text-3xl md:text-4xl font-bold text-white">od ~500 USD</p>
            <p className="mt-1 text-sm text-white/60">
              Próg rynkowy i kolejny poziom cenowy — jak wyżej; ostateczna kwota przy składaniu zamówienia na marketplace.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>Lifetime access — jednorazowy zakup, bez miesięcznej opłaty za dostęp dla posiadacza NFT</li>
              <li>Miesięczny refill Insightów oraz narzędzia edukacyjne i analiza kontekstu rynku w panelu</li>
              <li>Płatność w krypto: BTC / ETH / USDT (wg instrukcji przy zakupie)</li>
              <li>Dostęp przypisany do NFT — możesz odsprzedać token; korzyści czasowe przechodzą na nabywcę</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-xl bg-emerald-500 text-slate-950 font-semibold px-5 py-2.5 hover:bg-emerald-400"
              >
                Marketplace NFT
              </Link>
              <Link
                href="/prawne/nft"
                className="inline-flex items-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 text-sm font-medium"
              >
                Regulamin sprzedaży NFT
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/55">
              NFT nie jest instrumentem finansowym. Nie gwarantujemy płynności rynku wtórnego ani możliwości odsprzedaży.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Płatność i rozliczenie</h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-white/80">
            <li>
              Jednorazowa zapłata w krypto zgodnie z procesem zakupu opisanym w{" "}
              <Link href="/prawne/nft" className="underline">
                Regulaminie sprzedaży NFT
              </Link>
              .
            </li>
            <li>Ostateczna kwota może zależeć od kursu walut cyfrowych i opłat sieci blockchain w momencie transakcji.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Zwroty i odstąpienie</h2>
          <p className="text-white/80">
            Po zaksięgowaniu płatności i przekazaniu NFT mogą obowiązywać ustawowe wyłączenia prawa odstąpienia — szczegóły
            w{" "}
            <Link href="/prawne/zwroty-odstapienie" className="underline">
              Zwroty i odstąpienie
            </Link>{" "}
            oraz w{" "}
            <Link href="/prawne/nft" className="underline">
              Regulaminie NFT
            </Link>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl bg-[#0b1220] border border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
        <p className="text-white/80">
          Pytania o Founders NFT lub marketplace:{" "}
          <Link href="/kontakt?topic=zakup-pakietu" className="underline">
            formularz kontaktowy
          </Link>
          .
        </p>
        <p className="text-white/80 mt-2">FXEDULAB to platforma edukacyjna. Nie świadczymy porad inwestycyjnych.</p>
      </div>
    </main>
  );
}
