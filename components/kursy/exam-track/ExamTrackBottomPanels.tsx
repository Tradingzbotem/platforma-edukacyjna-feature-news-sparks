import type { ReactNode } from "react";

function Panel({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0b1220] p-5 md:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{kicker}</p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      ) : null}
      <div className="mt-5 flex-1">{children}</div>
    </section>
  );
}

export function ExamTrackMaterialsPanel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Panel
      kicker="Biblioteka"
      title="Materiały referencyjne"
      description="Dokumenty do pracy operacyjnej i powtórki przed testem — ten sam zestaw, wyższa czytelność."
    >
      {children}
    </Panel>
  );
}

export function ExamTrackPracticePanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Panel kicker="Symulacja" title={title} description={description}>
      {children}
    </Panel>
  );
}
