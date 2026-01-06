"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Wyjaśnij mi dźwignię 1:30 na przykładzie",
  "Jak liczyć wartość pipsa dla 0.1 lota na EURUSD?",
  "Czym różni się test OOS od walk-forward?",
  "Na czym polega Kelly i kiedy używać?",
];

const LS_CHAT = "ai:chat:v1";
const LS_OPEN = "ai:chat:open";

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Cześć! Jestem asystentem edukacyjnym FX/CFD. Zadaj pytanie z kursów/quizów – pomogę zrozumieć pojęcia. (To nie są porady inwestycyjne.)",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Wczytaj historię + stan otwarcia */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LS_CHAT);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
      const o = localStorage.getItem(LS_OPEN);
      if (o === "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  /* Zapisuj historię do localStorage */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_CHAT, JSON.stringify(messages));
    }
  }, [messages]);

  /* Zapisuj stan otwarcia */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_OPEN, open ? "1" : "0");
    }
  }, [open]);

  /* Auto-scroll na dół po nowej wiadomości */
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }

  async function ask(q?: string) {
    if (busy) return; // unikamy wielu równoległych próśb
    const question = (q ?? input).trim();
    if (question.length < 2) return;
    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Wygląda na to, że jesteś offline. Sprawdź połączenie internetowe i spróbuj ponownie.",
        },
      ]);
      return;
    }

    setBusy(true);
    setInput("");

    const newMessages: Msg[] = [
      ...messages,
      { role: "user", content: question },
      { role: "assistant", content: "" }, // placeholder na strumień
    ];
    setMessages(newMessages);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: newMessages.slice(0, -1) }),
        signal: controller.signal,
      });

      // 👉 ochrona przed HTML-em (np. strona błędu z Nexta) + czytelne komunikaty
      const contentType = res.headers.get("content-type") ?? "";
      if (!res.ok || !res.body || contentType.includes("text/html")) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          errText ||
            `Żądanie nie powiodło się (HTTP ${res.status}). Upewnij się, że serwer działa oraz że OPENAI_API_KEY jest poprawnie ustawione w .env.local, a dev serwer został zrestartowany.`
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          // aktualizujemy ostatnią (asystenta)
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⏹️ Generowanie przerwane." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Błąd podczas pobierania odpowiedzi: " +
              (err?.message || "nieznany problem") +
              "\n\nSprawdź, czy serwer działa oraz czy poprawnie ustawiono zmienną OPENAI_API_KEY w .env.local (potem restart dev serwera).",
          },
        ]);
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (busy) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  }

  function cleanContent(text: string) {
    // Usuń nagłówki markdown i nadmiarowe znaki formatowania
    return text
      // usuń linie zaczynające się od ###, ##, #
      .replace(/^\s*#{1,6}\s*/gm, "")
      // zamień wiele pustych linii na jedną
      .replace(/\n{3,}/g, "\n\n")
      // opcjonalnie usuń gwiazdki markdown dla pogrubień
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 rounded-full px-4 py-3 bg-white text-slate-900 font-semibold shadow-xl hover:opacity-90"
        aria-expanded={open}
        aria-controls="ai-widget"
      >
        {open ? "Zamknij AI" : "Zapytaj AI"}
      </button>

      {open && (
        <div
          id="ai-widget"
          className="fixed bottom-20 right-5 z-40 w-[min(92vw,420px)] rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="Asystent edukacyjny AI"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="font-semibold">Asystent edukacyjny (AI)</div>
              <div className="text-xs text-white/60">
                Edukacja FX/CFD • brak porad inwestycyjnych
              </div>
            </div>
            <div className="flex items-center gap-2">
              {busy ? (
                <button
                  onClick={stop}
                  className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                  title="Przerwij generowanie"
                >
                  Zatrzymaj
                </button>
              ) : null}
              <button
                onClick={() => setMessages((m) => m.slice(0, 1))}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                title="Wyczyść rozmowę"
              >
                Wyczyść
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            className="px-4 py-3 h-[360px] overflow-y-auto space-y-3 text-[13px] leading-6 antialiased"
            aria-live="polite"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 whitespace-pre-wrap leading-relaxed tracking-[.005em] ${
                  m.role === "user"
                    ? "ml-auto bg-white text-slate-900 shadow"
                    : "mr-auto bg-white/5 text-white/90 border border-white/10 backdrop-blur-sm"
                }`}
              >
                {cleanContent(m.content)}
              </div>
            ))}

            {!busy && (
              <div className="mt-2 text-[11px] text-white/50">
                Szybkie propozycje:
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 text-[11px] text-white/50">
            Odpowiedzi mają charakter edukacyjny i mogą zawierać błędy. Nie są
            rekomendacją inwestycyjną.
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
            className="p-3 flex gap-2"
          >
            <input
              className="flex-1 rounded-xl bg-slate-800 border border-white/10 px-3 py-2 outline-none focus:border-white/30 text-sm"
              placeholder={busy ? "AI pisze…" : "Zadaj pytanie (np. pips, Kelly, MiFID)…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={busy}
              aria-label="Treść pytania"
            />
            <button
              className="rounded-xl px-4 py-2 bg-white text-slate-900 font-semibold hover:opacity-90 disabled:opacity-40"
              disabled={busy}
            >
              Wyślij
            </button>
          </form>
        </div>
      )}
    </>
  );
}
