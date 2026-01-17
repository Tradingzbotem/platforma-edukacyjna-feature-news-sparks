import Link from 'next/link';
import Image from 'next/image';
import { BookIcon, RefreshIcon, ShieldIcon } from './Icons';

export default function Editorial() {
  const cards = [
    {
      title: 'Standardy redakcyjne',
      desc:
        'Publikujemy jasno, z kontekstem i bez szumu informacyjnego. Oddzielamy fakty od opinii i unikamy nieuzasadnionych prognoz.',
      Icon: ShieldIcon,
    },
    {
      title: 'Źródła i metodologia',
      desc:
        'Opieramy się na wiarygodnych źródłach: danych makro, raportach instytucji, sprawozdaniach spółek i komunikatach rynkowych.',
      Icon: BookIcon,
    },
    {
      title: 'Aktualizacje i sprostowania',
      desc:
        'Jeśli sytuacja się zmienia — aktualizujemy materiały. Błędy prostujemy transparentnie, dbając o rzetelność treści.',
      Icon: RefreshIcon,
    },
  ];

  return (
    <section className="py-12 lg:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Redakcja i standardy publikacji</h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-6">
            <Image
              src="/ai/redakcja.png"
              alt="Redakcja"
              width={600}
              height={400}
              className="w-full h-auto rounded-xl mb-6"
            />
            <p className="text-white/80 leading-relaxed mb-6">
              Sekcja redakcyjna FX•EDU śledzi wydarzenia na rynkach i dostarcza komentarze, które
              pomagają zrozumieć, co faktycznie wpływa na zmienność i warunki rynkowe — bez obietnic zysku.
            </p>
            <Link
              href="/redakcja"
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-semibold px-6 py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-opacity"
            >
              Przejdź do Redakcji
            </Link>
          </div>
        </div>
        <div>
          <div className="grid gap-6">
            {cards.map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-300" />
                  </span>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


