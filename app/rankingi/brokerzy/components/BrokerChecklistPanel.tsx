'use client';
import React from 'react';

export default function BrokerChecklistPanel() {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-6">
      <h3 className="text-lg font-semibold mb-2">Checklista wyboru brokera</h3>
      <div className="space-y-4 text-sm text-white/80">
        <section>
          <p className="font-semibold text-white/90 mb-1">Regulacja i jurysdykcja</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sprawdź rejestry (np. UE/CySEC), dokumenty, jurysdykcję.</li>
            <li>Zweryfikuj, pod jakim podmiotem zakładasz rachunek.</li>
          </ul>
        </section>
        <section>
          <p className="font-semibold text-white/90 mb-1">Ochrona klienta</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Segregacja środków, ujemne saldo — elementy do weryfikacji.</li>
            <li>Polityka realizacji zleceń i odpowiedzialność.</li>
          </ul>
        </section>
        <section>
          <p className="font-semibold text-white/90 mb-1">Koszty</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Spread/prowizja/swapy/rolowanie.</li>
            <li>Opłaty za brak aktywności, przelewy, wypłaty.</li>
          </ul>
        </section>
        <section>
          <p className="font-semibold text-white/90 mb-1">Egzekucja i instrumenty</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>CFD vs spot; dostępność zależy od regionu i typu konta.</li>
            <li>Weryfikuj instrumenty i limity na koncie.</li>
          </ul>
        </section>
        <section>
          <p className="font-semibold text-white/90 mb-1">Obsługa klienta</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Język PL, godziny wsparcia, kanały kontaktu, VIP 24h.</li>
            <li>Jakość onboardingu i szybkość odpowiedzi.</li>
          </ul>
        </section>
        <section>
          <p className="font-semibold text-white/90 mb-1">Platforma</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stabilność, narzędzia, wykres, mobilna/desktop.</li>
            <li>Integracje (MT4/MT5, cTrader, TradingView, własna).</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}


