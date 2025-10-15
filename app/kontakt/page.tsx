"use client";

import { useState } from "react";
import Link from "next/link";

export default function KontaktPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Błąd wysyłki. Spróbuj ponownie.");
      setStatus("ok");
      form.reset();
    } catch (err: any) {
      setError(err.message || "Coś poszło nie tak.");
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-8 space-y-6">
      <nav className="mb-2">
        <Link href="/" className="inline-flex items-center gap-2 text-sm rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10">← Strona główna</Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Kontakt</h1>
        <p className="text-white/70">Masz pytanie lub sugestię? Napisz do nas poniżej.</p>
      </header>

      <section className="rounded-2xl bg-[#0b1220] border border-white/10 p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80">Imię</label>
            <input id="name" name="name" type="text" required className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-white/80">Temat</label>
            <input id="subject" name="subject" type="text" required className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white/80">Wiadomość</label>
            <textarea id="message" name="message" required rows={6} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={status === "loading"} className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold disabled:opacity-60">
              {status === "loading" ? "Wysyłanie..." : "Wyślij wiadomość"}
            </button>
            {status === "ok" && <span className="text-emerald-400 text-sm">Wiadomość wysłana. Dziękujemy!</span>}
            {status === "error" && <span className="text-rose-400 text-sm">{error}</span>}
          </div>
        </form>
      </section>

      <section className="text-sm text-white/60">
        <p>
          Wysyłając formularz, zgadzasz się na przetwarzanie danych w celu udzielenia odpowiedzi.
          Szczegóły w dokumencie <Link href="/prawne/polityka" className="underline">Polityka prywatności</Link>.
        </p>
      </section>
    </main>
  );
}



