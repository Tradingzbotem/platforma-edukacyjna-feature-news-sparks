"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function KontaktPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const MIN_MESSAGE_LEN = 10;

  const preset = useMemo(() => {
    const topicRaw = (searchParams?.get("topic") || "").toLowerCase();
    const plan = (searchParams?.get("plan") || "").toLowerCase();
    const subjectFromQuery = (searchParams?.get("subject") || "").trim();
    const messageFromQuery = (searchParams?.get("message") || "").trim();

    const topic =
      topicRaw === "rejestracja"
        ? "rejestracja"
        : topicRaw === "zakup" || topicRaw === "zakup-pakietu"
        ? "zakup-pakietu"
        : "ogolne";

    const subjectFromTopic =
      topic === "rejestracja"
        ? "Rejestracja"
        : topic === "zakup-pakietu"
        ? "Zakup pakietu" + (plan ? ` (${plan.toUpperCase()})` : "")
        : "Pytanie ogólne";

    const subject = subjectFromQuery || subjectFromTopic;

    const message = messageFromQuery
      ? decodeURIComponent(messageFromQuery)
      : topic === "zakup-pakietu" && plan
      ? `Dzień dobry,\n\nChcę kupić pakiet: ${plan.toUpperCase()}.\nProszę o kontakt.\n\nPozdrawiam,\n`
      : "";

    return { topic, subject, message };
  }, [searchParams]);

  // dynamic UI state
  const [topic, setTopic] = useState(preset.topic);
  const [subject, setSubject] = useState(preset.subject);
  const [subjectEdited, setSubjectEdited] = useState(false);
  const [message, setMessage] = useState(preset.message);
  const [preferred, setPreferred] = useState<"email" | "phone">("email");

  useEffect(() => setTopic(preset.topic), [preset.topic]);
  useEffect(() => {
    if (!subjectEdited) setSubject(preset.subject);
  }, [preset.subject, subjectEdited]);
  useEffect(() => setMessage(preset.message), [preset.message]);

  // name/email persistence in localStorage via refs (no SSR issues)
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const n = localStorage.getItem("contact_name");
      const e = localStorage.getItem("contact_email");
      if (nameRef.current && n) nameRef.current.value = n;
      if (emailRef.current && e) emailRef.current.value = e;
    } catch {}
  }, []);
  function persistLocal(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (e.target.name === "name") localStorage.setItem("contact_name", e.target.value);
      if (e.target.name === "email") localStorage.setItem("contact_email", e.target.value);
    } catch {}
  }

  function helpForTopic(t: string) {
    if (t === "zakup-pakietu") {
      return (
        <p className="text-sm text-white/70">
          Chcesz kupić pakiet? Skontaktuj się z nami. Posiadamy jeszcze miejsca darmowe
          na 2026/2027 rok. Miejsca ograniczone.
        </p>
      );
    }
    if (t === "rejestracja") {
      return (
        <p className="text-sm text-white/70">
          Potrzebujesz pomocy z kontem lub logowaniem? Opisz krok po kroku, co się dzieje.
          Zwykle odpowiadamy w ciągu 24h w dni robocze.
        </p>
      );
    }
    return <p className="text-sm text-white/70">Masz pomysł lub pytanie? Chętnie pomożemy.</p>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    // Client-side validation to avoid API 400 for too-short messages
    if ((message || "").trim().length < MIN_MESSAGE_LEN) {
      setStatus("error");
      setError(`Wiadomość musi mieć co najmniej ${MIN_MESSAGE_LEN} znaków.`);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // enforce current UI state
    formData.set("topic", topic);
    formData.set("subject", subject || "");
    formData.set("message", message || "");
    formData.set("preferred", preferred);

    // Ensure required API fields exist; map topic → subject if subject missing
    if (!formData.get("subject") && formData.get("topic")) {
      const t = String(formData.get("topic"));
      const map: Record<string, string> = {
        "rejestracja": "Rejestracja",
        "zakup-pakietu": "Zakup pakietu",
        "ogolne": "Pytanie ogólne",
      };
      formData.set("subject", map[t] || "Kontakt");
    }
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Błąd wysyłki. Spróbuj ponownie.");
      }
      setStatus("ok");
      form.reset();
      setMessage("");
      setSubjectEdited(false);
    } catch (err: any) {
      setError(err.message || "Coś poszło nie tak.");
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8 space-y-6">
      <nav className="mb-2">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Kontakt</h1>
        <p className="text-white/70">Masz pytanie, chcesz kupić pakiet lub zgłosić sugestię? Napisz do nas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80">Imię</label>
                <input ref={nameRef} onChange={persistLocal} id="name" name="name" type="text" required className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80">Email</label>
                <input ref={emailRef} onChange={persistLocal} id="email" name="email" type="email" required className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-white/80">Wybierz temat</label>
                <select
                  id="topic"
                  name="topic"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (!subjectEdited) {
                      const map: Record<string, string> = {
                        "rejestracja": "Rejestracja",
                        "zakup-pakietu": "Zakup pakietu",
                        "ogolne": "Pytanie ogólne",
                      };
                      setSubject(map[e.target.value] || "Kontakt");
                    }
                  }}
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="rejestracja">Rejestracja</option>
                  <option value="zakup-pakietu">Zakup pakietu</option>
                  <option value="ogolne">Ogólne</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white/80">Temat</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setSubjectEdited(true);
                  }}
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-white/80">Preferowana forma kontaktu</span>
                <div className="mt-1 flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="preferred" value="email" checked={preferred === "email"} onChange={() => setPreferred("email")} />
                    Email
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="preferred" value="phone" checked={preferred === "phone"} onChange={() => setPreferred("phone")} />
                    Telefon
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white/80">Telefon (opcjonalnie)</label>
                <input id="phone" name="phone" type="tel" placeholder="+48 ..." className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white/80">Wiadomość</label>
              <textarea
                id="message"
                name="message"
                required
                minLength={MIN_MESSAGE_LEN}
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
              />
              <div className={`mt-1 text-xs ${message.length < MIN_MESSAGE_LEN ? "text-rose-400" : "text-white/50"}`}>
                {message.length}/5000 {message.length < MIN_MESSAGE_LEN ? `(min. ${MIN_MESSAGE_LEN})` : ""}
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <input id="consent" name="consent" type="checkbox" required className="mt-1" />
              <label htmlFor="consent" className="text-white/80">
                Wyrażam zgodę na kontakt w sprawie zapytania. Szczegóły w{" "}
                <Link href="/prawne/polityka" className="underline">Polityce prywatności</Link>.
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={status === "loading"} className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold disabled:opacity-60">
                {status === "loading" ? "Wysyłanie..." : "Wyślij wiadomość"}
              </button>
              {status === "ok" && (
                <span className="text-emerald-400 text-sm">
                  Wiadomość wysłana. Dziękujemy! Odpowiemy w ciągu 24h (dni robocze).
                </span>
              )}
              {status === "error" && <span className="text-rose-400 text-sm">{error}</span>}
            </div>
          </form>
        </section>

        <aside className="rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.03] border border-white/10 p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Szybkie wskazówki</h2>
            {helpForTopic(topic)}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/80">Czas odpowiedzi</h3>
            <p className="text-sm text-white/70">Zwykle odpowiadamy w ciągu 24 godzin w dni robocze.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/80">Alternatywy</h3>
            <ul className="text-sm text-white/70 list-disc pl-5 space-y-1">
              <li>
                Email:{" "}
                <a className="underline" href="mailto:kontakt@platforma-edukacyjna.com">
                  kontakt@platforma-edukacyjna.com
                </a>
              </li>
              <li>FAQ: <Link href="/zasoby/faq" className="underline">Najczęstsze pytania</Link></li>
              <li>Regulamin: <Link href="/prawne/warunki-korzystania" className="underline">Warunki korzystania</Link></li>
              <li>Prywatność: <Link href="/prawne/polityka-prywatnosci" className="underline">Polityka prywatności</Link></li>
              <li>Zwroty: <Link href="/prawne/zwroty-odstapienie" className="underline">Zwroty i odstąpienie</Link></li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="text-sm text-white/60">
        <p>
          Wysyłając formularz, zgadzasz się na przetwarzanie danych w celu udzielenia odpowiedzi.
          Szczegóły w dokumencie <Link href="/prawne/polityka" className="underline">Polityka prywatności</Link>.
        </p>
      </section>
    </main>
  );
}