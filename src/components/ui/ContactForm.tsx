"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";
import { apiPost, errorMessage } from "@/lib/api";
import { CheckIcon, ChatIcon } from "@/components/ui/icons";

/** Fomu ya mawasiliano — huhifadhi ujumbe kwenye backend (+ njia ya WhatsApp). */
export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      await apiPost("/api/messages", {
        kind: "contact",
        name,
        phone,
        body: { message },
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const field =
    "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

  if (done) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-ink-900">
              Asante, ujumbe wako umepokelewa!
            </p>
            <p className="text-sm text-ink-500">
              Tutakujibu kwa simu ndani ya saa chache za kazi.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={waLink(`Habari ${site.name}, ${message}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <ChatIcon className="h-4 w-4" />
            Endelea kwa WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setMessage("");
            }}
            className="btn-outline"
          >
            Tuma ujumbe mwingine
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Jina lako *
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Jina lako"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Namba ya simu *
          </span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
            placeholder="0754 000 000"
            inputMode="tel"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          Ujumbe wako *
        </span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={field}
          placeholder="Tuliza swali lako hapa…"
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className="btn-primary disabled:opacity-60"
        >
          <ChatIcon className="h-4 w-4" />
          {sending ? "Inatuma…" : "Tuma ujumbe"}
        </button>
        <a
          href={waLink(`Habari ${site.name}! Jina: ${name}\nSimu: ${phone}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          WhatsApp moja kwa moja
        </a>
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <CheckIcon className="h-4 w-4 text-success-600" />
          Majibu ndani ya saa chache za kazi
        </p>
      </div>
    </form>
  );
}
