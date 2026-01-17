'use client';
import type { ReactNode } from "react";

export type Lesson = { id:string; title:string; minutes:number; free?:boolean; content:ReactNode; };

const M1 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>CySEC & CIF – podstawy</h3>
    <ul>
      <li><strong>CySEC</strong>: cypryjski nadzorca; licencjonuje CIF (Cyprus Investment Firms).</li>
      <li>Paszportowanie w UE na podstawie MiFID; współpraca z ESMA.</li>
      <li>Zakres: obrót, doradztwo, zarządzanie, dystrybucja produktów (w tym CFD).</li>
    </ul>
    <h3>System compliance</h3>
    <ul>
      <li>Funkcje: Compliance, Risk, Internal Audit; niezależność i raportowanie do zarządu.</li>
      <li>Policies: konflikty, best execution, outsourcing, marketing, reklamacje, AML.</li>
    </ul>
  </div>
);

const M2 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Wytyczne CySEC dla CFD i marketingu</h3>
    <ul>
      <li>Ostrzeżenia ESMA, zrównoważenie przekazu; zakaz gwarancji zysku i bonusów wprowadzających w błąd.</li>
      <li>Procedura zatwierdzania materiałów marketingowych przez compliance; rejestr i przechowywanie.</li>
      <li>Monitoring kanałów (strona, social, partnerzy); odpowiedzialność za przekaz partnerów.</li>
    </ul>
    <h3>Ochrona klienta</h3>
    <ul>
      <li>Negative balance protection, margin close-out, limity dźwigni; disclosure kosztów.</li>
      <li>Wymogi dot. szkoleń personelu i rejestru rozmów.</li>
    </ul>
  </div>
);

const M3 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Outsourcing, partnerzy, cross-border</h3>
    <ul>
      <li>Umowy z dostawcami: due diligence, SLA, monitoring ryzyka, exit plan.</li>
      <li>Partnerzy marketingowi/IB: zgodność przekazu z wytycznymi CySEC/ESMA.</li>
      <li>Działalność transgraniczna: powiadomienia, nadzór rynku docelowego.</li>
    </ul>
    <h3>Skargi klientów i raportowanie</h3>
    <ul>
      <li>Rejestr skarg, terminy odpowiedzi, korekty, analiza przyczyn źródłowych (root cause).</li>
      <li>Raporty do CySEC, odpowiedzialność zarządu (governance).</li>
    </ul>
  </div>
);

const M4 = (
  <div className="prose prose-invert prose-slate max-w-none">
    <h3>Materiały & egzamin</h3>
    <ul>
      <li><a href="/materialy/cysec/circulars-podsumowanie.pdf" target="_blank">CySEC Circulars — podsumowanie (PDF)</a></li>
      <li><a href="/materialy/cysec/wytyczne-marketing-cfd.pdf" target="_blank">Wytyczne marketingowe CFD (PDF)</a></li>
      <li><a href="/materialy/cysec/lista-kontroli-compliance.docx" target="_blank">Lista kontroli compliance (DOCX)</a></li>
    </ul>
    <p>Egzamin: 20 pytań, case’y marketingowe, governance i ochrona klienta.</p>
  </div>
);

export const LESSONS: Lesson[] = [
  { id:'m1', title:'Moduł 1: CySEC & CIF — fundamenty (preview)', minutes:18, free:true, content:M1 },
  { id:'m2', title:'Moduł 2: CFD, marketing i ochrona klienta', minutes:24, content:M2 },
  { id:'m3', title:'Moduł 3: Outsourcing, partnerzy, skargi', minutes:22, content:M3 },
  { id:'m4', title:'Moduł 4: Materiały + egzamin', minutes:16, content:M4 },
];
