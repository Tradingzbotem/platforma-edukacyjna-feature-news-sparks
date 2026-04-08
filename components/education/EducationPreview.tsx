import Link from 'next/link';
import { Fragment } from 'react';
import {
  Award,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LineChart,
  Shield,
  TrendingUp,
  UserRound,
  Users,
  Waypoints,
} from 'lucide-react';
import type { EducationPreviewCopy } from '@/lib/educationPreviewCopy';

const cardBase =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md p-5 sm:p-6 shadow-lg shadow-black/20';

/** Kafelki „Czego nauczysz się” — delikatny glow emerald/cyan przy hover. */
const learnTileClass =
  'group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md p-5 sm:p-6 shadow-lg shadow-black/20 transition-[border-color,box-shadow,background-color] duration-300 hover:border-emerald-400/35 hover:from-white/[0.08] hover:to-white/[0.04] hover:shadow-[0_0_44px_-10px_rgba(52,211,153,0.22),0_0_36px_-14px_rgba(34,211,238,0.12)]';

/** Ostatni kafel — efekt końcowy: ta sama szerokość co pozostałe, jaśniejsze tło + mocniejszy hover. */
const learnFeaturedTileClass =
  'group rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-white/[0.09] to-white/[0.045] backdrop-blur-md p-5 sm:p-6 shadow-lg shadow-emerald-950/20 transition-[border-color,box-shadow,background-color] duration-300 hover:border-emerald-400/50 hover:from-white/[0.12] hover:to-white/[0.06] hover:shadow-[0_0_56px_-8px_rgba(52,211,153,0.35),0_0_48px_-14px_rgba(34,211,238,0.22)]';

const btnPrimary =
  'inline-flex justify-center items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-opacity text-center';

const btnSecondary =
  'inline-flex justify-center items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors text-center';

/** Drugorzędny CTA w hero — wyraźnie słabszy od głównego przycisku startu. */
const btnHeroSecondary =
  'inline-flex justify-center items-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/60 hover:border-white/15 hover:bg-white/[0.06] hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/15 transition-colors text-center';

const pillClass =
  'inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80';

const MODULE_HREFS = [
  '/kursy/forex',
  '/kursy/materialy/analiza-techniczna',
  '/kursy/zaawansowane',
  '/kursy/materialy/psychologia-inwestowania',
  '/kursy/materialy/kalendarz-ekonomiczny',
  '/kursy/materialy/formacje-swiecowe',
] as const;

/** Mini pseudo-QR (6×6) — tylko wizualny placeholder, bez danych. */
const HERO_CERT_QR_BITS: boolean[] = [
  true, true, true, false, true, true, //
  true, false, true, false, false, true, //
  true, true, false, true, true, false, //
  false, true, true, false, true, true, //
  true, false, false, true, false, true, //
  true, true, false, true, true, true, //
];

type Props = {
  copy: EducationPreviewCopy;
};

export function EducationPreview({ copy: c }: Props) {
  const courses = [
    { title: c.course_0_title, desc: c.course_0_desc, href: MODULE_HREFS[0] },
    { title: c.course_1_title, desc: c.course_1_desc, href: MODULE_HREFS[1] },
    { title: c.course_2_title, desc: c.course_2_desc, href: MODULE_HREFS[2] },
    { title: c.course_3_title, desc: c.course_3_desc, href: MODULE_HREFS[3] },
    { title: c.course_4_title, desc: c.course_4_desc, href: MODULE_HREFS[4] },
    { title: c.course_5_title, desc: c.course_5_desc, href: MODULE_HREFS[5] },
  ];

  const learnBlocks = [
    { title: c.learn_0_title, desc: c.learn_0_desc, Icon: TrendingUp },
    { title: c.learn_1_title, desc: c.learn_1_desc, Icon: LineChart },
    { title: c.learn_2_title, desc: c.learn_2_desc, Icon: Shield },
    { title: c.learn_3_title, desc: c.learn_3_desc, Icon: Waypoints },
  ];

  const processFlowSteps = [
    { title: c.process_0_title, desc: c.process_0_desc },
    { title: c.process_1_title, desc: c.process_1_desc },
    { title: c.process_2_title, desc: c.process_2_desc },
    { title: c.process_3_title, desc: c.process_3_desc },
  ] as const;

  const audienceCards = [
    { title: c.audience_0_title, desc: c.audience_0_desc, Icon: UserRound },
    { title: c.audience_1_title, desc: c.audience_1_desc, Icon: Users },
    { title: c.audience_2_title, desc: c.audience_2_desc, Icon: Award },
  ];

  const learningPathSteps = [c.path_courses, c.path_quizzes, c.path_exam, c.path_certificate] as const;
  const heroValueItems = [
    { title: c.hero_value_0_title, desc: c.hero_value_0_desc, Icon: BookOpen },
    { title: c.hero_value_1_title, desc: c.hero_value_1_desc, Icon: ClipboardList },
    { title: c.hero_value_2_title, desc: c.hero_value_2_desc, Icon: GraduationCap },
  ] as const;
  const learningPathAriaLabel = learningPathSteps.join(', ');

  return (
    <main id="content" className="min-h-[60vh] border-t border-white/10 bg-slate-950 text-white">
      {/* Hero — lewa: treść + wartość; prawa: podgląd certyfikatu */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div
            className="rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/40 backdrop-blur-md"
            aria-labelledby="edu-hero-title"
          >
            <div className="grid gap-8 lg:gap-x-10 lg:grid-cols-[minmax(0,1fr)_minmax(288px,348px)] items-start">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">{c.eyebrow}</p>
                <h1
                  id="edu-hero-title"
                  className="mt-3 text-2xl sm:text-3xl lg:text-[2rem] font-bold tracking-tight text-white max-w-xl leading-tight"
                >
                  {c.hero_title}
                </h1>
                <p className="mt-4 text-base sm:text-[17px] text-white/75 leading-relaxed max-w-xl">
                  {c.hero_desc}
                </p>
                <p className="mt-3 max-w-xl text-sm sm:text-[15px] font-semibold leading-snug text-white/88">
                  {c.hero_killer_line}
                </p>
                <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/50">{c.hero_social_proof}</p>
                <nav
                  className="mt-5 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 sm:px-4 sm:py-3.5 shadow-[0_0_40px_-12px_rgba(16,185,129,0.15)]"
                  aria-label={learningPathAriaLabel}
                >
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-1 sm:gap-x-1.5">
                    {learningPathSteps.map((label, i) => (
                      <Fragment key={label}>
                        {i > 0 ? (
                          <ChevronRight
                            className="h-3.5 w-3.5 shrink-0 text-white/25 sm:h-4 sm:w-4"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        ) : null}
                        <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-white/88 sm:px-3 sm:text-xs">
                          {label}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </nav>
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-3.5">
                  <div className="flex flex-wrap gap-2">
                    <span className={pillClass}>{c.hero_pill_0}</span>
                    <span className={pillClass}>{c.hero_pill_1}</span>
                    <span className={pillClass}>{c.hero_pill_2}</span>
                  </div>
                </div>
                <div className="mt-7">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    {c.hero_cta_micro_label}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:flex-wrap">
                    <Link href="/kursy" className={btnPrimary}>
                      {c.cta_courses}
                    </Link>
                    <Link href="/quizy" className={btnHeroSecondary}>
                      {c.cta_quizzes}
                    </Link>
                  </div>
                  <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/50">{c.hero_cta_reassurance}</p>
                  <div className="mt-2 max-w-xl space-y-1.5">
                    <p className="text-xs leading-relaxed text-white/58">{c.hero_cta_microcopy}</p>
                    <p className="text-[11px] leading-relaxed text-white/45">{c.hero_cta_cert_hint}</p>
                  </div>
                </div>

                <div className="mt-7" aria-labelledby="edu-hero-value-heading">
                  <p
                    id="edu-hero-value-heading"
                    className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70"
                  >
                    {c.hero_value_heading}
                  </p>
                  <ul className="mt-3 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-3 sm:gap-2.5">
                    {heroValueItems.map(({ title, desc, Icon }) => (
                      <li
                        key={title}
                        className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                          <Icon className="h-4 w-4 text-emerald-300/90" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold leading-snug text-white">{title}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-white/58">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside
                className="min-w-0 max-w-md sm:max-w-none mx-auto w-full lg:mx-0 lg:max-w-none lg:col-start-2 flex flex-col gap-2.5"
                aria-label={c.hero_cert_frame_label}
              >
                <div className="flex justify-center lg:justify-start">
                  <span className="inline-flex rounded-full border border-[#8a7340]/40 bg-[#c9a962]/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e4cf7a]/85">
                    {c.hero_cert_value_badge}
                  </span>
                </div>
                {/* Outer / inner frame — inspirowane PDF (podwójna ramka, graphite + amber hairlines) */}
                <div className="rounded-[11px] border border-[#8a7340]/55 p-[2px] shadow-sm shadow-black/30">
                  <div className="rounded-[9px] border border-[#1e2430]/90 bg-[#080b11] px-3 py-3 sm:px-3.5 sm:py-3.5">
                    <div className="flex items-start justify-between gap-2 border-b border-[#8a7340]/35 pb-2">
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-[#e4cf7a]">{c.hero_cert_brand}</p>
                        <p className="mt-0.5 text-[8px] leading-tight tracking-wide text-[#b8b3a8]">{c.hero_cert_brand_sub}</p>
                      </div>
                      <div className="shrink-0 rounded-sm border border-[#8a7340]/45 bg-[#0c1018] px-2 py-1 text-right">
                        <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#c9a962]">
                          {c.hero_cert_track_badge_line1}
                        </p>
                        <p className="mt-0.5 text-[6px] uppercase tracking-wide text-[#7a756c]">
                          {c.hero_cert_track_badge_line2}
                        </p>
                      </div>
                    </div>

                    <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.2em] text-[#7a756c]">{c.hero_cert_frame_label}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-px flex-1 bg-[#8a7340]/55" aria-hidden />
                      <div className="h-1 w-1 shrink-0 rounded-full bg-[#c9a962]/90" aria-hidden />
                      <div className="h-px flex-1 bg-[#8a7340]/55" aria-hidden />
                    </div>

                    <div className="mt-2.5 text-center">
                      <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#8a7340]">{c.hero_cert_prestige}</p>
                      <p className="mt-1.5 font-serif text-[12px] font-semibold leading-tight tracking-tight text-[#e4cf7a] sm:text-[13px]">
                        {c.hero_cert_main_title}
                      </p>
                    </div>

                    <div className="mt-2 border-t border-[#1e2430] pt-2 text-center">
                      <p className="text-[8px] italic text-[#b8b3a8]">{c.hero_cert_certifies}</p>
                      <p className="mt-1 font-serif text-[11px] font-medium tracking-wide text-[#f2efe6]/90">{c.hero_cert_holder_sample}</p>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-[#1e2430] pt-2.5">
                      <div className="border-t border-[#8a7340]/40 bg-[#0c1018]/90 px-1 py-1.5 text-center">
                        <p className="text-[6px] font-semibold uppercase tracking-[0.14em] text-[#7a756c]">{c.hero_cert_score_label}</p>
                        <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-[#f2efe6]">{c.hero_cert_score_sample}</p>
                      </div>
                      <div className="border-t border-[#8a7340]/40 bg-[#0c1018]/90 px-1 py-1.5 text-center">
                        <p className="text-[6px] font-semibold uppercase tracking-[0.14em] text-[#7a756c]">{c.hero_cert_date_label}</p>
                        <p className="mt-0.5 font-mono text-[9px] font-medium tabular-nums text-[#e4cf7a]/90">
                          {c.hero_cert_date_sample}
                        </p>
                      </div>
                      <div className="border-t border-[#8a7340]/40 bg-[#0c1018]/90 px-1 py-1.5 text-center">
                        <p className="text-[6px] font-semibold uppercase tracking-[0.14em] text-[#7a756c]">{c.hero_cert_id_label}</p>
                        <p className="mt-0.5 break-all font-mono text-[6px] leading-tight text-[#e4cf7a]/85">{c.hero_cert_id_sample}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-[#1e2430] pt-2">
                      <div>
                        <p className="text-[6px] uppercase tracking-wide text-[#7a756c]">{c.hero_cert_verify_scan}</p>
                        <div
                          className="mt-1 grid grid-cols-6 gap-px rounded border border-[#1e2430] bg-[#1e2430] p-0.5"
                          aria-hidden
                        >
                          {HERO_CERT_QR_BITS.map((on, i) => (
                            <span
                              key={i}
                              className={`aspect-square rounded-[1px] ${on ? 'bg-[#f2efe6]/90' : 'bg-[#0c1018]'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 pb-0.5">
                        <BadgeCheck className="h-3.5 w-3.5 text-[#c9a962]/85" strokeWidth={1.75} aria-hidden />
                        <p className="max-w-[7rem] text-right text-[6px] font-medium uppercase tracking-wide text-[#7a756c]">
                          {c.hero_cert_verified_badge}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-0.5 text-center lg:text-left">
                  <p className="text-[10px] leading-snug text-white/48 sm:text-[11px]">{c.hero_cert_caption}</p>
                  <p className="mt-1.5 text-[10px] leading-snug text-white/42 sm:text-[11px]">{c.hero_cert_proof_line}</p>
                  <p className="mt-1.5 text-[10px] leading-snug text-emerald-200/55 sm:text-[11px]">{c.hero_cert_use_line}</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Czego nauczysz się w FXEDULAB */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-14 lg:pb-16"
        aria-labelledby="edu-learn"
      >
        <h2 id="edu-learn" className="text-2xl sm:text-3xl font-bold tracking-tight">
          {c.learn_heading}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-white/65 max-w-2xl">{c.learn_intro}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {learnBlocks.map(({ title, desc, Icon }, i) => {
            const isFeatured = i === learnBlocks.length - 1;
            const shell = isFeatured ? learnFeaturedTileClass : learnTileClass;
            const iconWrap = isFeatured
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-white/[0.06] transition-[border-color,background-color] duration-300 group-hover:border-cyan-400/35 group-hover:bg-white/[0.09]'
              : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-[border-color,background-color] duration-300 group-hover:border-cyan-400/25 group-hover:bg-white/[0.07]';
            return (
              <article key={title} className={`${shell} flex h-full flex-col`}>
                {isFeatured ? (
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/70">{c.learn_featured_tag}</p>
                ) : null}
                <div className={`${iconWrap} ${isFeatured ? 'mt-3' : ''}`}>
                  <Icon
                    className="h-5 w-5 text-emerald-300 transition-colors duration-300 group-hover:text-emerald-200"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white transition-colors duration-300 group-hover:text-white">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70 transition-colors duration-300 group-hover:text-white/85">
                  {desc}
                </p>
                {isFeatured ? (
                  <p className="mt-3 text-sm leading-snug text-white/80">{c.learn_featured_kicker}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {/* Jak wygląda nauka — timeline (pionowy mobile / poziomy desktop) */}
      <section className="border-t border-white/10 bg-white/[0.02]" aria-labelledby="edu-process">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/70">{c.process_label}</p>
          <h2 id="edu-process" className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            {c.process_heading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/65 max-w-2xl">{c.process_intro}</p>

          <div className="relative mt-12 lg:mt-14">
            {/* Pozioma linia progresu — tylko lg; lekki glow */}
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-5 z-0 hidden h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500/15 via-emerald-400/45 via-cyan-400/35 to-emerald-500/15 shadow-[0_0_18px_rgba(52,211,153,0.45),0_0_32px_rgba(34,211,238,0.15)] motion-safe:animate-[pulse_4s_ease-in-out_infinite] lg:block"
              aria-hidden
            />

            <ol className="relative z-[1] m-0 grid list-none grid-cols-1 gap-0 p-0 lg:grid-cols-4 lg:gap-6">
              {processFlowSteps.map((step, i) => {
                const isFirst = i === 0;
                const isLast = i === processFlowSteps.length - 1;
                const circleClass = [
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300',
                  'group-hover:border-emerald-400/60 group-hover:bg-emerald-500/20 group-hover:text-white',
                  'group-hover:shadow-[0_0_32px_rgba(52,211,153,0.5),0_0_24px_rgba(34,211,238,0.22)] group-hover:ring-2 group-hover:ring-emerald-400/40',
                  isFirst
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-white shadow-[0_0_24px_rgba(52,211,153,0.4)] ring-2 ring-emerald-400/30'
                    : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
                ].join(' ');
                return (
                  <li
                    key={step.title}
                    className="group flex items-stretch gap-5 pb-10 last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:pb-0 lg:text-center"
                  >
                    <div className="relative flex w-10 shrink-0 flex-col items-center self-stretch lg:mb-5 lg:w-auto lg:self-auto">
                      <span className={circleClass} aria-hidden>
                        {i + 1}
                      </span>
                      {!isLast ? (
                        <div
                          className="mx-auto mt-3 w-px flex-1 min-h-12 bg-gradient-to-b from-emerald-400/50 via-emerald-400/15 to-white/[0.06] transition-opacity duration-300 group-hover:from-emerald-300/70 group-hover:via-cyan-400/25 lg:hidden"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5 lg:flex-none lg:px-1 lg:pt-0">
                      <h3 className="text-base font-semibold text-white transition-colors duration-300 group-hover:text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70 transition-colors duration-300 group-hover:text-white/85">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Grid modułów */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16" aria-labelledby="edu-preview-courses">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2 id="edu-preview-courses" className="text-2xl sm:text-3xl font-bold tracking-tight">
            {c.courses_heading}
          </h2>
        </div>
        <p className="mt-2 text-sm sm:text-base text-white/65 max-w-2xl">{c.courses_sub}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article key={course.title} className={`${cardBase} flex h-full flex-col`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <BookOpen className="h-5 w-5 text-emerald-300" aria-hidden />
                </div>
                <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  {c.course_badge}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white tracking-tight">{course.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{course.desc}</p>
              <p className="mt-3 text-xs text-white/50">{c.course_note}</p>
              <Link
                href={course.href}
                className="mt-5 inline-flex w-full justify-center items-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-colors text-center sm:w-auto sm:self-start"
              >
                {c.course_cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Dla kogo jest ta edukacja */}
      <section className="border-t border-white/10 bg-white/[0.02]" aria-labelledby="edu-audience">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <h2 id="edu-audience" className="text-2xl sm:text-3xl font-bold tracking-tight">
            {c.audience_heading}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {audienceCards.map(({ title, desc, Icon }) => (
              <article key={title} className={`${cardBase} flex h-full flex-col`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-emerald-300" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Dolny info box */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div
            className={`${cardBase} flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-emerald-400/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02]`}
          >
            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-3xl">{c.info_bar}</p>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/logowanie" className={btnSecondary}>
                {c.login}
              </Link>
              <Link href="/rejestracja" className={btnPrimary}>
                {c.register}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
