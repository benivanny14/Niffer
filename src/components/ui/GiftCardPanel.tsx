"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";
import { formatTsh } from "@/lib/format";
import { ChatIcon, CheckIcon, SparkleIcon } from "@/components/ui/icons";

const amounts = [10000, 25000, 50000, 100000];

const steps = [
  {
    title: "Chagua thamani",
    description: "Kadi ya zawadi kutoka TSh 10,000 hadi TSh 100,000.",
  },
  {
    title: "Tuma kwa WhatsApp",
    description: "Tutakutumia msimbo wa kadi na maelekezo ya malipo.",
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

  const waText = `Habari ${site.name}, nataka kadi ya zawadi ya ${formatTsh(
    amount,
  )}.${recipient ? ` Mpokeaji: ${recipient}.` : ""}${
    message ? ` Ujumbe: ${message}` : ""
  }`;

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
                    : "border-cream-300 bg-white hover:border-brand-300"
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
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
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
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
            />
          </label>

          <a
            href={waLink(waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6 w-full"
          >
            <ChatIcon className="h-4 w-4" />
            Agiza kadi kwa WhatsApp — {formatTsh(amount)}
          </a>
          <p className="mt-3 text-center text-xs text-ink-400">
            Kadi ya kipekee hutumika kwa oda yoyote na haikuwi na muda.
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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
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
