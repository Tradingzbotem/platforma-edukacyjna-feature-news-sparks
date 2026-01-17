'use client';

import Image from "next/image";
import Link from "next/link";

type BlacklistedEntity = {
  name: string;
  reason: string;
  regulator: string;
  date?: string;
  sourceUrl?: string;
};

type Regulator = {
  name: string;
  country: string;
  logo: string;
  blacklistUrl: string;
  description: string;
};

const BLACKLISTED_ENTITIES: BlacklistedEntity[] = [
  // Przykładowe podmioty - można rozszerzyć o rzeczywiste dane z regulatorów
  {
    name: "Przykładowy Broker XYZ",
    reason: "Działanie bez licencji, oszustwa",
    regulator: "KNF",
    date: "2024-01-15",
    sourceUrl: "https://www.knf.gov.pl/"
  },
  // Dodaj więcej podmiotów tutaj
];

const REGULATORS: Regulator[] = [
  {
    name: "KNF",
    country: "PL",
    logo: "/logos/regulators/knf.svg",
    blacklistUrl: "https://www.knf.gov.pl/",
    description: "Ostrzeżenia i czarna lista KNF"
  },
  {
    name: "FCA",
    country: "UK",
    logo: "/logos/regulators/fca.svg",
    blacklistUrl: "https://www.fca.org.uk/news/warnings",
    description: "Ostrzeżenia FCA o nieautoryzowanych firmach"
  },
  {
    name: "CySEC",
    country: "CY",
    logo: "/logos/regulators/cysec.svg",
    blacklistUrl: "https://www.cysec.gov.cy/en-GB/publications/warnings/",
    description: "Ostrzeżenia CySEC"
  },
  {
    name: "ESMA",
    country: "EU",
    logo: "/logos/regulators/esma.svg",
    blacklistUrl: "https://www.esma.europa.eu/investor-corner/warnings-and-public-statements",
    description: "Ostrzeżenia ESMA"
  },
  {
    name: "BaFin",
    country: "DE",
    logo: "/logos/regulators/bafin.svg",
    blacklistUrl: "https://www.bafin.de/EN/Aufsicht/FinTech/Warnungen/warnungen_node_en.html",
    description: "Ostrzeżenia BaFin"
  },
  {
    name: "FSMA",
    country: "BE",
    logo: "/logos/regulators/FSMA.svg",
    blacklistUrl: "https://www.fsma.be/en/warnings",
    description: "Ostrzeżenia FSMA"
  },
  {
    name: "CSSF",
    country: "LU",
    logo: "/logos/regulators/cssf.svg",
    blacklistUrl: "https://www.cssf.lu/en/supervision/warnings/",
    description: "Ostrzeżenia CSSF"
  },
  {
    name: "FINMA",
    country: "CH",
    logo: "/logos/regulators/FINMA.svg",
    blacklistUrl: "https://www.finma.ch/en/finma-public/warnings/",
    description: "Ostrzeżenia FINMA"
  },
];

export default function BlacklistSection() {
  return (
    <section id="blacklist" className="space-y-6">
      <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 to-rose-500/10 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 rounded-xl bg-red-500/20 p-3">
            <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Czarna lista fxedulab</h2>
            <p className="text-white/90 leading-relaxed mb-4">
              Poniżej znajdują się podmioty, które znajdują się na oficjalnych czarnych listach regulatorów finansowych. 
              <strong className="text-red-300"> Unikaj inwestowania u tych podmiotów.</strong> Zawsze sprawdzaj aktualne ostrzeżenia na stronach regulatorów.
            </p>
          </div>
        </div>

        {/* Blacklisted entities */}
        {BLACKLISTED_ENTITIES.length > 0 ? (
          <div className="space-y-3 mb-6">
            {BLACKLISTED_ENTITIES.map((entity, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 hover:bg-red-500/10 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{entity.name}</h3>
                      <span className="rounded-md border border-red-400/40 bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                        {entity.regulator}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mb-1">{entity.reason}</p>
                    {entity.date && (
                      <p className="text-xs text-white/60">Data: {entity.date}</p>
                    )}
                  </div>
                  {entity.sourceUrl && (
                    <a
                      href={entity.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-red-300 hover:text-red-200 transition"
                      aria-label="Źródło"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-6">
            <p className="text-sm text-white/70 text-center">
              Aktualnie brak podmiotów na liście. Lista będzie aktualizowana na podstawie oficjalnych ostrzeżeń regulatorów.
            </p>
          </div>
        )}

        {/* Regulators links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Sprawdź czarne listy regulatorów:</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REGULATORS.map((reg) => (
              <a
                key={reg.name}
                href={reg.blacklistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] hover:border-white/20 transition"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={reg.logo}
                    alt={`${reg.name} logo`}
                    width={32}
                    height={32}
                    className="h-8 w-auto object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{reg.name}</div>
                  <div className="text-xs text-white/60 truncate">{reg.description}</div>
                </div>
                <svg className="w-4 h-4 text-white/40 group-hover:text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
