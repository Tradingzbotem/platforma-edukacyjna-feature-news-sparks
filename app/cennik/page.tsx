import Link from "next/link";
import {
  FoundersLockedBenefitsBlock,
  FoundersPricingLadderBlock,
} from "@/components/marketplace/FoundersMarketPanels";
import { isFoundersMarketplaceSalesPaused } from "@/lib/marketplace/offers";

export default function PricingPage() {
  const salesPaused = isFoundersMarketplaceSalesPaused();
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

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1220] p-5 sm:p-6 text-sm text-white/80 space-y-3">
        <h2 className="text-base font-semibold text-white">Co kupujesz (model usługi cyfrowej)</h2>
        <ul className="list-disc pl-5 space-y-2 leading-relaxed">
          <li>
            <strong>Dostęp cyfrowy</strong> do funkcji Serwisu (panel EDU, moduły, materiały) w zakresie opisanym przy
            Founders NFT — to usługa cyfrowa, nie produkt inwestycyjny, lokata ani zarządzanie Twoim kapitałem.
          </li>
          <li>
            <strong>Czas trwania:</strong> dla posiadacza NFT — dostęp typu lifetime w rozumieniu opisu przy zakupie (bez
            miesięcznej opłaty abonamentowej za ten sam poziom); szczegóły i wyjątki w{" "}
            <Link href="/prawne/nft" className="underline">
              regulaminie NFT
            </Link>
            .
          </li>
          <li>
            <strong>Bonusy czasowe</strong> (np. refill Insightów, promocyjne okresy) mają zasięg i termin wskazany przy
            ofercie — po ich zakończeniu obowiązuje układ podstawowy wariantu, o ile nie przedłużono bonusu.
          </li>
          <li>
            Część ceny może mieć charakter <strong>wsparcia rozwoju projektu</strong>; treści i narzędzia mają charakter{" "}
            <strong>edukacyjny i analityczny</strong> — bez doradztwa inwestycyjnego i bez sygnałów transakcyjnych.
          </li>
        </ul>
        <p className="text-xs text-white/55 pt-2 border-t border-white/10">
          Dokumenty:{" "}
          <Link href="/prawne/regulamin" className="underline">
            regulamin serwisu
          </Link>
          ,{" "}
          <Link href="/prawne/nft" className="underline">
            regulamin NFT
          </Link>
          ,{" "}
          <Link href="/prawne/polityka-prywatnosci" className="underline">
            polityka prywatności
          </Link>
          ,{" "}
          <Link href="/prawne/zwroty-odstapienie" className="underline">
            zwroty i odstąpienie
          </Link>
          .
        </p>
      </div>
      {salesPaused ? (
        <p
          className="mt-4 max-w-2xl rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
          role="status"
        >
          <strong className="font-semibold text-amber-50">Brak miejsc</strong> — pierwotna sprzedaż NFT i dostępów jest na razie
          wstrzymana. Poniższy cennik ma charakter informacyjny.
        </p>
      ) : null}

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
              Orientacyjny próg w ofertach i listingach na marketplace (szczegóły jak wyżej); ostateczną kwotę widzisz przy
              składaniu zamówienia.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>
                Jednorazowy zakup dostępu cyfrowego przypisanego do NFT — bez miesięcznej opłaty za ten sam poziom dostępu;
                zakres i czas trwania zgodnie z opisem oferty oraz regulaminem NFT
              </li>
              <li>Miesięczny refill Insightów oraz narzędzia edukacyjne i analiza kontekstu rynku w panelu</li>
              <li>Płatność w krypto: BTC / ETH / USDT (wg instrukcji przy zakupie)</li>
              <li>
                Dostęp jest powiązany z NFT; zasady przeniesienia uprawnień oraz ewentualnych korzyści czasowych określa
                regulamin NFT
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              {salesPaused ? (
                <span
                  className="inline-flex cursor-not-allowed items-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/45"
                  aria-disabled
                >
                  Brak miejsc
                </span>
              ) : (
                <Link
                  href="/marketplace"
                  className="inline-flex items-center rounded-xl bg-emerald-500 text-slate-950 font-semibold px-5 py-2.5 hover:bg-emerald-400"
                >
                  Marketplace NFT
                </Link>
              )}
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
            Prawo odstąpienia od umowy zawartej na odległość — w przypadku konsumentów — co do zasady wynosi 14 dni. Po
            rozpoczęciu świadczenia usługi cyfrowej lub po rozpoczęciu dostarczania treści cyfrowych może ono zostać
            ograniczone lub wyłączone w przypadkach przewidzianych przepisami. Szczegółowe zasady znajdziesz w{" "}
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
