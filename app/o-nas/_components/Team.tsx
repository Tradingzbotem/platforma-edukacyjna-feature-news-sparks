'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function Team() {
  const [editorError, setEditorError] = useState(false);
  const [analystError, setAnalystError] = useState(false);

  return (
    <section className="py-12 lg:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Zespół tworzący</h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Poznaj osoby odpowiedzialne za selekcję tematów, metodologię publikacji i tworzenie narzędzi edukacyjnych.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Card - Redakcja i metodologia */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 lg:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left: Large portrait image */}
            <div className="relative w-full lg:w-52 h-64 lg:h-auto lg:min-h-[260px] flex-shrink-0 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-md">
              {!editorError ? (
                <Image
                  src="/ai/assistant-editor.png.png"
                  alt="Redakcja i metodologia"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 208px"
                  onError={() => setEditorError(true)}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                  Brak zdjęcia
                </div>
              )}
            </div>
            {/* Right: Content */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">Redakcja i metodologia</h3>
              <span className="inline-block rounded-full bg-teal-500/20 border border-teal-500/20 text-teal-200 px-3 py-1 text-xs mb-3 w-fit">
                Edukacyjnie
              </span>
              <p className="text-sm lg:text-base text-white/70 mb-4 leading-relaxed">
                Standaryzacja publikacji, selekcja tematów, korekty i aktualizacje.
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>Briefy i kontekst</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>Oddzielanie faktów od opinii</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>Transparentne sprostowania</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Card - Produkt i narzędzia edukacyjne */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 lg:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left: Large portrait image */}
            <div className="relative w-full lg:w-52 h-64 lg:h-auto lg:min-h-[260px] flex-shrink-0 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-md">
              {!analystError ? (
                <Image
                  src="/ai/assistant-analyst.png.png"
                  alt="Produkt i narzędzia edukacyjne"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 208px"
                  onError={() => setAnalystError(true)}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                  Brak zdjęcia
                </div>
              )}
            </div>
            {/* Right: Content */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">Produkt i narzędzia edukacyjne</h3>
              <span className="inline-block rounded-full bg-teal-500/20 border border-teal-500/20 text-teal-200 px-3 py-1 text-xs mb-3 w-fit">
                Proces i ryzyko
              </span>
              <p className="text-sm lg:text-base text-white/70 mb-4 leading-relaxed">
                Projekt modułów, checklist i praktycznych ćwiczeń — proces zamiast prognoz.
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>Scenariusze A/B/C</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>Quizy i weryfikacja wiedzy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                  <span>Decision Lab / praktyka</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-white/50 text-xs max-w-2xl mx-auto">
          Zdjęcia mają charakter poglądowy (wizerunki generowane). Platforma ma charakter edukacyjny i nie stanowi doradztwa inwestycyjnego.
        </p>
      </div>
    </section>
  );
}


