import { BriefcaseIcon, CapIcon, ChartIcon, GearIcon } from './Icons';

export default function Team() {
  const roles = [
    {
      title: 'Praktycy rynku',
      desc:
        'Wnoszą kontekst działania i realne scenariusze, które pomagają zrozumieć proces podejmowania decyzji.',
      Icon: BriefcaseIcon,
    },
    {
      title: 'Traderzy',
      desc:
        'Testują materiały i ćwiczenia pod presją decyzji, akcentując konsekwencje i ramy ryzyka.',
      Icon: ChartIcon,
    },
    {
      title: 'Twórcy edukacyjni',
      desc:
        'Upraszczają język i tworzą ścieżkę nauki: od podstaw, przez quizy, po pracę na checklistach.',
      Icon: CapIcon,
    },
    {
      title: 'Zespół technologiczny',
      desc:
        'Buduje narzędzia i interfejsy, które zamieniają wiedzę w praktyczne kroki do wykonania.',
      Icon: GearIcon,
    },
  ];

  return (
    <section className="mt-14">
      <h2 className="text-2xl md:text-3xl font-bold">Kto stoi za projektem?</h2>
      <div className="mt-6 grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-6">
            <p className="text-white/80">
              Zaczynaliśmy od prostego założenia: uczyć decyzji, nie prognoz. Z czasem
              dołożyliśmy checklisty, scenariusze i quizy, aby połączyć teorię z działaniem.
              Dziś skupiamy się na procesie i odpowiedzialnym podejściu do ryzyka.
            </p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-6">
            {roles.map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="rounded-2xl bg-slate-900/60 border border-white/10 shadow-xl shadow-black/30 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="mt-2 text-sm text-white/75">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


