"use client";

import { useState } from "react";
import { apiPost, errorMessage } from "@/lib/api";
import { MailIcon, CheckIcon } from "@/components/ui/icons";

/** Fomu ya jarida — huhifadhi barua pepe kwenye backend. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [note, setNote] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const data = await apiPost<{ ok: boolean; message: string }>(
        "/api/newsletter",
        { email, source: "footer" },
      );
      setNote(data.message);
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-700">
          {note || "Asante!"}{" "}
          <span className="font-semibold">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-cream-300 bg-surface px-4">
          <MailIcon className="h-4.5 w-4.5 shrink-0 text-ink-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barua.pepe@mfano.com"
            aria-label="Anwani ya barua pepe"
            className="w-full bg-transparent py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="btn-primary shrink-0 disabled:opacity-60"
        >
          {sending ? "Inaweka…" : "Jiunge Sasa"}
        </button>
      </div>
      {error ? (
        <p className="mt-2 px-2 text-xs text-danger-600">{error}</p>
      ) : (
        <p className="mt-2 px-2 text-xs text-ink-400">
          Tutatuma ofa muhimu tu. Unaweza kuacha wakati wowote.
        </p>
      )}
    </form>
  );
}
