"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";
import { formatTsh } from "@/lib/format";
import { apiPost, errorMessage } from "@/lib/api";
import { ChatIcon, CheckIcon, SparkleIcon } from "@/components/ui/icons";

const amounts = [10000, 25000, 50000, 100000];

const steps = [
  {
    title: "Chagua thamani",
    description: "Kadi ya zawadi kutoka TSh 10,000 hadi TSh 100,000.",
  },
  {
    title: "Pokea msimbo wa pekee",
    description: "Msimbo hutengenezwa mara moja na unaweza kutumwa kwa WhatsApp.",
  },
  {
    title: "Apokee na anufaike",
    description: "Mpokeaji hutumia msimbo kwenye oda yoyote ya Niffer.",
  },
];

export function GiftCardPanel() {
  const [amount, setAmount] = useState(amounts[1]);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState<{
    code: string;
    amountTsh: number;
    expiresAt?: string;
  } | null>(null);

  async function issue() {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const data = await apiPost<{
        ok: boolean;
        giftCard: { code: string; amountTsh: number; expiresAt?: string };
      }>("/api/giftcards", { amountTsh: amount, recipient, message });
      setIssued({
        code: data.giftCard.code,
        amountTsh: data.giftCard.amountTsh,
        expiresAt: data.giftCard.expiresAt,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const waText = `Habari ${site.name}, nataka kadi ya zawadi ya ${formatTsh(
    amount,
  )}.${issued ? ` Msimbo: ${issued.code}.` : ""}${
    recipient ? ` Mpokeaji: ${recipient}.` : ""
  }${message ? ` Ujumbe: ${message}` : ""}`;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
        {/* Chagua */}
        <div className="card p-6">
          <h2 className="font-display text-xl text-ink-900">
            1. Chagua thamani ya kadi
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {amounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-xl border p-4 text-center transition-colors ${
                  amount === value
                    ? "border-brand-600 bg-brand-50"
                    : "border-cream-300 bg-surface hover:border-brand-300"
                }`}
              >
                <span className="block font-display text-xl text-ink-900">
                  {formatTsh(value)}
                </span>
                <span className="mt-1 block text-xs text-ink-500">
                  {value >= 50000 ? "Bure usafirishaji" : "Inatumika popote"}
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl text-ink-900">
            2. Maelezo ya ziada (hiari)
          </h2>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Jina la mpokeaji
            </span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Mfano: Neema"
              className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Ujumbe wa zawadi
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Mfano: Hongera siku yako ya kuzaliwa!"
              className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
            />
          </label>

          {issued ? (
            <div className="mt-6 rounded-2xl border border-success-200 bg-success-50 p-5 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600">
                <CheckIcon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm text-ink-500">
                Msimbo wako wa kadi ({formatTsh(issued.amountTsh)}):
              </p>
              <p className="font-display mt-1 text-2xl tracking-wide text-ink-900">
                {issued.code}
              </p>
              <p className="mt-2 text-xs text-ink-500">
                Hifadhi msimbo huu — utautumia kwenye oda yoyote ya Niffer
                {issued.expiresAt
                  ? ` kabla ya ${new Date(issued.expiresAt).toLocaleDateString("sw-TZ")}`
                  : ""}
                .
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={issue}
            disabled={sending}
            className="btn-primary mt-6 w-full disabled:opacity-60"
          >
            <ChatIcon className="h-4 w-4" />
            {sending
              ? "Inatengeneza kadi…"
              : issued
                ? "Agiza kadi nyingine"
                : `Agiza kadi — ${formatTsh(amount)}`}
          </button>

          {issued ? (
            <a
              href={waLink(waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-3 w-full"
            >
              Tuma msimbo kwa WhatsApp
            </a>
          ) : null}
          <p className="mt-3 text-center text-xs text-ink-400">
            Kadi ya kipekee hutumika kwa oda yoyote na inaisha baada ya miaka 1.
          </p>
        </div>

        {/* Maelezo */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-cream-300 bg-gradient-to-br from-brand-200 via-cream-200 to-gold-100 p-8 text-center">
            <SparkleIcon className="mx-auto h-10 w-10 text-brand-600" />
            <p className="mt-4 font-display text-3xl text-ink-900">
              Niffer Gift Card
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Thamani: {formatTsh(amount)}
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold-700">
              Urembo wa kweli
            </p>
          </div>

          <ol className="mt-8 space-y-6">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink-900">{step.title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-8 space-y-2.5 rounded-2xl bg-cream-100 p-5 text-sm text-ink-500">
            {[
              "Kadi inatumika kwa bidhaa zote za Niffer Cosmetics",
              "Haiwezi kubadilishwa kuwa pesa taslimu",
              "Msimbo wa kadi hutumika mara moja hadi thamani ipungue",
              "Kadi inaisha miaka 1 baada ya kutolewa",
            ].map((note) => (
              <li key={note} className="flex gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                {note}
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}
