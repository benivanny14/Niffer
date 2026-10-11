"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";
import { CheckIcon, ChatIcon } from "@/components/ui/icons";

/** Fomu ya mawasiliano — hutuma kwa WhatsApp (backend ikija). */
export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Habari ${site.name}!\nJina: ${name}\nSimu: ${phone}\nUjumbe: ${message}`;
    window.open(waLink(text), "_blank", "noopener");
  }

  const field =
    "w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

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
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary">
          <ChatIcon className="h-4 w-4" />
          Tuma kwa WhatsApp
        </button>
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <CheckIcon className="h-4 w-4 text-success-600" />
          Majibu ndani ya saa chache za kazi
        </p>
      </div>
    </form>
  );
}
