'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LESSONS, type LessonMeta } from "./data";

const AUTH_KEY = 'auth:pro';
const PROGRESS_KEY = 'course:egz:przewodnik:done';

function Card({ children, className="" }:{children:React.ReactNode;className?:string}) {
  return <section className={`rounded-2xl bg-[#0b1220] border border-white/10 p-6 ${className}`}>{children}</section>;
}
function LockOverlay({ show }:{show:boolean}) {
  if(!show) return null;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="text-3xl">🔒</div>
      <p className="mt-2 text-center text-slate-200">Moduł dla zalogowanych (lub DEV odblokuj).</p>
      <div className="mt-3 flex gap-3">
        <Link href="/konto" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Zaloguj / Zarejestruj</Link>
        <button onClick={()=>{localStorage.setItem(AUTH_KEY,'1');location.reload();}} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Odblokuj (DEV)</button>
      </div>
    </div>
  );
}

export default function Page(){
  const [isPro,setIsPro]=useState(false);
  const [active,setActive]=useState<string>(LESSONS[0].slug);
  const [done,setDone]=useState<string[]>([]);
  useEffect(()=>{ setIsPro(localStorage.getItem(AUTH_KEY)==='1');
    const raw=localStorage.getItem(PROGRESS_KEY); if(raw) setDone(JSON.parse(raw));},[]);
  const lesson=LESSONS.find(l=>l.slug===active)!; const locked=!isPro && !!(lesson as any).pro;
  const progress=useMemo(()=>Math.round(done.length/LESSONS.length*100),[done]);
  const toggle=()=>{ const key = lesson.slug; const next=done.includes(key)?done.filter(x=>x!==key):Array.from(new Set([...done,key]));
    setDone(next); localStorage.setItem(PROGRESS_KEY,JSON.stringify(next)); };

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/kursy" className="text-sm underline">← Wróć do kursów</Link>
          <h1 className="mt-2 text-3xl font-semibold">Przewodnik: KNF • ESMA • MiFID</h1>
          <p className="text-slate-300">Szybka orientacja + konkretne checklisty.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-300">Postęp</div>
          <div className="mt-1 w-48 h-2 rounded bg-white/10 overflow-hidden"><div className="h-full bg-white" style={{width:`${progress}%`}}/></div>
          <div className="mt-1 text-sm text-slate-300">{progress}%</div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <h2 className="text-lg font-semibold">Program kursu</h2>
          <ul className="mt-4 space-y-2">
            {LESSONS.map(l=>{
              const activeNow=l.slug===active; const isLocked=!isPro && !!(l as any).pro; const isDone=done.includes(l.slug);
              return (
                <li key={l.slug}>
                  <button onClick={()=>setActive(l.slug)} className={`w-full text-left rounded-xl px-3 py-2 border ${activeNow?'bg-white text-slate-900 border-white':'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{l.title}</span>
                        {!((l as any).pro) && <span className="text-xs rounded bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5">preview</span>}
                        {isLocked && <span title="lock">🔒</span>}
                      </div>
                      <span className="text-xs text-slate-300">{l.minutes} min {isDone?'• ✓':''}</span>
                    </div>
                  </button>
                </li>
              );})}
          </ul>
          {!isPro && (
            <div className="mt-4 space-y-2">
              <Link href="/konto" className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90">Zarejestruj i odblokuj</Link>
              <button onClick={()=>{localStorage.setItem(AUTH_KEY,'1');setIsPro(true);}} className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Odblokuj (DEV)</button>
            </div>
          )}
        </Card>

        <div className="relative">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{lesson.title}</h2>
                <p className="text-slate-400 text-sm">Szacowany czas: {lesson.minutes} min</p>
              </div>
              <button onClick={toggle} className={`px-3 py-1.5 rounded-lg font-semibold ${done.includes(lesson.slug)?'bg-green-400 text-slate-900 hover:opacity-90':'bg-white/10 hover:bg-white/20'}`}>
                {done.includes(lesson.slug)?'✓ Ukończono':'Oznacz jako ukończone'}
              </button>
            </div>
            <div className="mt-4"></div>
            <LockOverlay show={locked}/>
          </Card>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold">Materiały</h3>
              <ul className="mt-2 list-disc pl-6 text-slate-300">
                <li><a href="/materialy/przewodnik/mifid-kompendium.pdf" target="_blank">MiFID – kompendium (PDF)</a></li>
                <li><a href="/materialy/przewodnik/checklista-dokumenty-klienta.pdf" target="_blank">Checklista dokumentów (PDF)</a></li>
                <li><a href="/materialy/przewodnik/sciaga-terminy.docx" target="_blank">Ściąga terminów (DOCX)</a></li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold">Egzamin próbny</h3>
              <p className="text-slate-300">15–20 pytań, wyjaśnienia, wynik.</p>
              <div className="mt-3"><Link href="/kursy/egzaminy/przewodnik/egzamin" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 inline-block">Uruchom test</Link></div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
