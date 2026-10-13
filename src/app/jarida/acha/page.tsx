"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost, errorMessage } from "@/lib/api";
import { CheckIcon } from "@/components/ui/icons";

/** Kurasa ya kujiondoa kwenye jarida la Niffer. */
export default function NewsletterUnsubscribePage() {
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
        "/api/newsletter/unsubscribe",
        { email },
      );
      setNote(data.message);
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-x max-w-xl py-16 lg:py-20">
      <p className="eyebrow">Jarida la Niffer</p>
      <h1 className="heading-display mt-2">Jiondoe kwenye jarida</h1>
      <p className="mt-3 text-ink-500">
        Weka barua pepe uliyojisajilia nayo tutakuoondoa kwenye orodha ya
        jarida. Hutapokea tena ofa zetu.
      </p>

      {done ? (
        <div className="card mt-8 flex items-center gap-3 p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckIcon className="h-5 w-5" />
          </span>
          <p className="text-sm text-ink-700">
            {note}{" "}
            <span className="font-semibold">{email}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="card mt-8 p-6">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Barua pepe
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="wewe@mfano.com"
              autoComplete="email"
              className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
            />
          </label>
          {error ? (
            <p className="mt-2 text-sm text-danger-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={sending}
            className="btn-primary mt-4 disabled:opacity-60"
          >
            {sending ? "Inaondoa…" : "Jiondoe kwenye jarida"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-ink-500">
        <Link href="/" className="text-accent underline hover:text-accent/80">
          Rudi nyumbani
        </Link>
      </p>
    </div>
  );
}
